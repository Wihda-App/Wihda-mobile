import { useNavigate } from 'react-router';
import MobileContainer from '../components/MobileContainer';
import PageTransition from '../components/PageTransition';
import { ArrowLeft, Leaf, Users, Award, Heart, Globe, Phone, Mail, FlaskConical } from 'lucide-react'; // Leaf, Users, Award, Heart also used in valuesData
import { useApp } from '../context/AppContext';
import { t, Lang } from '../lib/i18n';

const APP_VERSION = '1.0.0-beta';

const missionText: Record<Lang, string> = {
  en: 'Wihda (وحدة) means "unity" in Arabic. We believe that communities thrive when neighbors help each other. Our platform makes it easy to share food, goods, and skills with the people living right next door — reducing waste, fostering connections, and rewarding those who give back.',
  ar: 'وحدة تعني "الوحدة" بالعربية. نؤمن بأن المجتمعات تزدهر عندما يساعد الجيران بعضهم البعض. تُيسّر منصتنا مشاركة الطعام والبضائع والمهارات مع من يعيشون على مقربة منك — مما يُقلل الهدر ويُعزز الروابط ويُكافئ من يُعطون.',
};

const valuesData: Record<Lang, { title: string; desc: string; icon: typeof Users; color: string; bg: string; darkBg: string }[]> = {
  en: [
    { title: 'Community First', desc: 'Every feature is built to strengthen local bonds and encourage neighbor-to-neighbor interaction.', icon: Users, color: 'text-[#14ae5c]', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/30' },
    { title: 'Reduce Waste', desc: 'By sharing what we have and cleaning up what we find, we make our neighborhoods cleaner and greener.', icon: Leaf, color: 'text-blue-500', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30' },
    { title: 'Reward Good Actions', desc: 'Earn coins and badges for every positive contribution. Good deeds deserve recognition.', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-900/30' },
    { title: 'Trust & Safety', desc: "Verified identities and neighborhood boundaries ensure you always know who you're dealing with.", icon: Heart, color: 'text-red-400', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/30' },
  ],
  ar: [
    { title: 'المجتمع أولاً', desc: 'كل ميزة مُصممة لتعزيز الروابط المحلية وتشجيع التفاعل بين الجيران.', icon: Users, color: 'text-[#14ae5c]', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/30' },
    { title: 'تقليل الهدر', desc: 'بمشاركة ما لدينا وتنظيف ما نجده، نجعل أحياءنا أنظف وأكثر خضرة.', icon: Leaf, color: 'text-blue-500', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/30' },
    { title: 'مكافأة الأعمال الطيبة', desc: 'اكسب عملات وشارات مقابل كل مساهمة إيجابية. الأعمال الطيبة تستحق التقدير.', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-900/30' },
    { title: 'الثقة والأمان', desc: 'الهويات الموثّقة وحدود الأحياء تضمن أنك تعرف دائماً من تتعامل معه.', icon: Heart, color: 'text-red-400', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/30' },
  ],
};

export default function About() {
  const navigate = useNavigate();
  const { language } = useApp();

  return (
    <MobileContainer>
      <PageTransition>
      <div className="flex flex-col size-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="px-5 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center h-14 gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200">
              <ArrowLeft className="size-6" />
            </button>
            <h1 className="text-[18px] font-semibold text-gray-900 dark:text-white flex-1 font-[Poppins,sans-serif]">{t(language, 'aboutTitle')}</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-10 px-5">
          {/* Hero */}
          <div className="bg-gradient-to-r from-[#14ae5c] to-emerald-500 rounded-2xl p-6 mb-4 flex flex-col items-center text-center">
            <div className="size-16 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
              <Leaf className="size-8 text-white" />
            </div>
            <h2 className="text-white text-[22px] font-bold font-[Poppins,sans-serif]">Wihda</h2>
            <p className="text-white/80 text-[13px] mt-1">Version {APP_VERSION}</p>
            <p className="text-white/90 text-[13px] mt-3 leading-relaxed">
              Connecting neighbors to share resources, reduce waste, and build stronger communities.
            </p>
          </div>

          {/* Beta notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-800 rounded-full p-2 shrink-0">
              <FlaskConical className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">{t(language, 'betaBadge')} Version</p>
              <p className="text-[12px] text-amber-700 dark:text-amber-400 mt-0.5">{t(language, 'betaDesc')}</p>
            </div>
          </div>

          {/* Mission */}
          <div className="mb-5">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t(language, 'ourMission')}</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
                {missionText[language]}
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-5">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t(language, 'whatWeStandFor')}</h3>
            <div className="space-y-3">
              {valuesData[language].map((item) => (
                <div key={item.title} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                  <div className={`${item.bg} ${item.darkBg} rounded-full p-2 shrink-0`}>
                    <item.icon className={`size-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">{item.title}</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mb-5">
            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t(language, 'contactTitle')}</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-[#14ae5c] shrink-0" />
                <a href="mailto:contact@wihdaapp.com" className="text-[13px] text-[#14ae5c] font-medium">contact@wihdaapp.com</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-[#14ae5c] shrink-0" />
                <a
                  href="https://wa.me/213549599182"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[13px] text-[#14ae5c] font-medium"
                  dir="ltr"
                >
                  +213 549 599 182
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-[#14ae5c] shrink-0" />
                <a href="https://wihdaapp.com" target="_blank" rel="noreferrer" className="text-[13px] text-[#14ae5c] font-medium">wihdaapp.com</a>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-300 dark:text-gray-600 mt-4">© 2025 Wihda. All rights reserved.</p>
        </div>
      </div>
      </PageTransition>
    </MobileContainer>
  );
}
