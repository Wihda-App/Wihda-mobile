import svgPaths from "./svg-epjersa4ep";
import imgBlackBase21 from "figma:asset/f8be3de4437e1cac58b18e621c164a5db92d3b96.png";
import imgWihdaTextLogo1 from "figma:asset/ee118e5efe643d9ee6880fd61bb3d74d5253e1aa.png";

function Group() {
  return (
    <div className="absolute inset-[71.55%_65.33%_26.97%_31.47%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Group">
          <path d={svgPaths.p9e2c980} fill="var(--fill-0, black)" id="Vector" />
          <path clipRule="evenodd" d={svgPaths.p3c6bb200} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[28px] top-[232px]">
      <Group />
      <div className="absolute left-[28px] size-[319px] top-[232px]" data-name="wihda text logo 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgWihdaTextLogo1} />
      </div>
    </div>
  );
}

export default function Splash() {
  return (
    <div className="bg-white relative size-full" data-name="SPLASH">
      <div className="absolute h-[41px] left-0 top-0 w-[375px]" data-name="Black Base 2 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgBlackBase21} />
      </div>
      <div className="absolute bg-black h-[4px] left-[105px] rounded-[10px] top-[801px] w-[165px]" />
      <Group1 />
      <div className="absolute left-[83px] size-[31px] top-[199px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <circle cx="15.5" cy="15.5" fill="var(--fill-0, #52ADE5)" id="Ellipse 8" r="15.5" />
        </svg>
      </div>
      <div className="absolute left-[83px] size-[31px] top-[660px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <circle cx="15.5" cy="15.5" fill="var(--fill-0, #52ADE5)" id="Ellipse 8" r="15.5" />
        </svg>
      </div>
      <div className="absolute left-[295px] size-[31px] top-[566px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31 31">
          <circle cx="15.5" cy="15.5" fill="var(--fill-0, #52ADE5)" id="Ellipse 8" r="15.5" />
        </svg>
      </div>
      <div className="absolute left-[261px] size-[49px] top-[121px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 49">
          <circle cx="24.5" cy="24.5" fill="var(--fill-0, #52ADE5)" id="Ellipse 11" r="24.5" />
        </svg>
      </div>
      <div className="absolute left-[34px] size-[49px] top-[388px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 49">
          <circle cx="24.5" cy="24.5" fill="var(--fill-0, #52ADE5)" id="Ellipse 11" r="24.5" />
        </svg>
      </div>
      <div className="absolute left-[286px] size-[49px] top-[448px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 49">
          <circle cx="24.5" cy="24.5" fill="var(--fill-0, #52ADE5)" id="Ellipse 11" r="24.5" />
        </svg>
      </div>
    </div>
  );
}