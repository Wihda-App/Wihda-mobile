import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-user-token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper: get authenticated user
async function getAuthUser(c: any) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

  // The client sends the user's access token via the custom x-user-token header.
  // Authorization header always carries the anon key for the Supabase gateway.
  const token = c.req.header("x-user-token");
  if (!token) return { user: null, supabase };

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.log("Auth error (non-fatal):", error.message);
      return { user: null, supabase };
    }
    return { user, supabase };
  } catch (err) {
    console.log("Auth getUser exception:", err);
    return { user: null, supabase };
  }
}

// Idempotently create storage buckets on startup
const initStorage = async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucket = "make-b33448f7-avatars";
    const postsBucket = "make-b33448f7-posts";
    
    if (!buckets?.some((b: any) => b.name === avatarBucket)) {
      await supabase.storage.createBucket(avatarBucket, { public: false });
      console.log("Created bucket:", avatarBucket);
    }
    if (!buckets?.some((b: any) => b.name === postsBucket)) {
      await supabase.storage.createBucket(postsBucket, { public: false });
      console.log("Created bucket:", postsBucket);
    }
  } catch (e) {
    console.log("Storage init error:", e);
  }
};
initStorage();

// Health check
app.get("/make-server-b33448f7/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== AUTH ==========

// POST /signup
app.post("/make-server-b33448f7/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error.message);
      return c.json({ error: error.message }, 400);
    }

    // Create initial profile in KV
    const profile = {
      id: data.user.id,
      name,
      email,
      bio: "",
      location: "Hadjam Moukhtar",
      photoUrl: "",
      coins: 100, // Welcome bonus
      itemsShared: 0,
      activitiesJoined: 0,
      volunteerHours: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:profile:${data.user.id}`, profile);
    console.log("Created profile for user:", data.user.id);

    return c.json({ success: true, userId: data.user.id });
  } catch (err) {
    console.log("Signup handler error:", err);
    return c.json({ error: `Signup failed: ${err}` }, 500);
  }
});

// ========== PROFILE ==========

// GET /profile - get current user's profile
app.get("/make-server-b33448f7/profile", async (c) => {
  const { user } = await getAuthUser(c);
  if (!user?.id) {
    return c.json({ error: "Unauthorized - no valid session for profile fetch" }, 401);
  }

  try {
    let profile = await kv.get(`user:profile:${user.id}`);
    
    // If profile doesn't exist yet (e.g. first login), create it
    if (!profile) {
      profile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        bio: "",
        location: "Hadjam Moukhtar",
        photoUrl: "",
        coins: 100,
        itemsShared: 0,
        activitiesJoined: 0,
        volunteerHours: 0,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user:profile:${user.id}`, profile);
    }

    return c.json({ profile });
  } catch (err) {
    console.log("Profile fetch error:", err);
    return c.json({ error: `Failed to fetch profile: ${err}` }, 500);
  }
});

// PUT /profile - update profile
app.put("/make-server-b33448f7/profile", async (c) => {
  const { user } = await getAuthUser(c);
  if (!user?.id) {
    return c.json({ error: "Unauthorized - no valid session for profile update" }, 401);
  }

  try {
    const updates = await c.req.json();
    const existing = await kv.get(`user:profile:${user.id}`);
    
    if (!existing) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Don't allow changing id or email
    delete updates.id;
    delete updates.email;

    const updated = { ...existing, ...updates };
    await kv.set(`user:profile:${user.id}`, updated);

    return c.json({ profile: updated });
  } catch (err) {
    console.log("Profile update error:", err);
    return c.json({ error: `Failed to update profile: ${err}` }, 500);
  }
});

// POST /profile/photo - upload profile photo
app.post("/make-server-b33448f7/profile/photo", async (c) => {
  const { user, supabase } = await getAuthUser(c);
  if (!user?.id) {
    return c.json({ error: "Unauthorized - no valid session for photo upload" }, 401);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get("photo");
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No photo file provided" }, 400);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;
    const bucket = "make-b33448f7-avatars";

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.log("Photo upload error:", uploadError);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Create signed URL (valid for 1 year)
    const { data: signedData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 365 * 24 * 60 * 60);

    const photoUrl = signedData?.signedUrl || "";

    // Update profile with new photo URL
    const existing = await kv.get(`user:profile:${user.id}`);
    if (existing) {
      existing.photoUrl = photoUrl;
      await kv.set(`user:profile:${user.id}`, existing);
    }

    return c.json({ photoUrl });
  } catch (err) {
    console.log("Photo upload handler error:", err);
    return c.json({ error: `Photo upload failed: ${err}` }, 500);
  }
});

// ========== POSTS ==========

// GET /posts - get all posts (optionally filter by category)
app.get("/make-server-b33448f7/posts", async (c) => {
  try {
    const category = c.req.query("category");
    const posts = await kv.getByPrefix("post:");
    
    let filtered = posts || [];
    if (category) {
      filtered = filtered.filter((p: any) => p.category === category);
    }
    
    // Sort by creation date descending
    filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ posts: filtered });
  } catch (err) {
    console.log("Posts fetch error:", err);
    return c.json({ error: `Failed to fetch posts: ${err}` }, 500);
  }
});

// GET /posts/user/:userId - get posts by a specific user
app.get("/make-server-b33448f7/posts/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const posts = await kv.getByPrefix("post:");
    const userPosts = (posts || []).filter((p: any) => p.userId === userId);
    userPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ posts: userPosts });
  } catch (err) {
    console.log("User posts fetch error:", err);
    return c.json({ error: `Failed to fetch user posts: ${err}` }, 500);
  }
});

// POST /posts - create a new post
app.post("/make-server-b33448f7/posts", async (c) => {
  const { user, supabase } = await getAuthUser(c);
  if (!user?.id) {
    return c.json({ error: "Unauthorized - must be logged in to create posts" }, 401);
  }

  try {
    const formData = await c.req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string || "give"; // give or get
    const location = formData.get("location") as string || "";
    const coins = parseInt(formData.get("coins") as string || "0");
    const photo = formData.get("photo");

    if (!title || !category) {
      return c.json({ error: "Title and category are required" }, 400);
    }

    const postId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let imageUrl = "";

    // Upload post image if provided
    if (photo && photo instanceof File && photo.size > 0) {
      const ext = photo.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${postId}.${ext}`;
      const bucket = "make-b33448f7-posts";

      const arrayBuffer = await photo.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType: photo.type,
          upsert: true,
        });

      if (uploadError) {
        console.log("Post image upload error:", uploadError);
      } else {
        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 365 * 24 * 60 * 60);
        imageUrl = signedData?.signedUrl || "";
      }
    }

    // Get user profile for name/photo
    const profile = await kv.get(`user:profile:${user.id}`);

    const post = {
      id: postId,
      userId: user.id,
      userName: profile?.name || "Anonymous",
      userPhoto: profile?.photoUrl || "",
      title,
      description: description || "",
      category,
      type,
      location: location || profile?.location || "",
      coins,
      image: imageUrl,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`post:${postId}`, post);

    // Increment user's items shared count
    if (profile) {
      profile.itemsShared = (profile.itemsShared || 0) + 1;
      // Reward coins for sharing
      profile.coins = (profile.coins || 0) + (coins > 0 ? Math.floor(coins * 0.1) : 10);
      await kv.set(`user:profile:${user.id}`, profile);
    }

    console.log("Created post:", postId, "by user:", user.id);
    return c.json({ post });
  } catch (err) {
    console.log("Post creation error:", err);
    return c.json({ error: `Failed to create post: ${err}` }, 500);
  }
});

// DELETE /posts/:id - delete a post
app.delete("/make-server-b33448f7/posts/:id", async (c) => {
  const { user } = await getAuthUser(c);
  if (!user?.id) {
    return c.json({ error: "Unauthorized - must be logged in to delete posts" }, 401);
  }

  try {
    const postId = c.req.param("id");
    const post = await kv.get(`post:${postId}`);
    
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }
    if (post.userId !== user.id) {
      return c.json({ error: "Not authorized to delete this post" }, 403);
    }

    await kv.del(`post:${postId}`);
    return c.json({ success: true });
  } catch (err) {
    console.log("Post deletion error:", err);
    return c.json({ error: `Failed to delete post: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);