import Image from "next/image";
import Link from "next/link";

export default function HomeFounderSection() {
  return (
    <section className="relative bg-[#f5f1e6] overflow-hidden lg:min-h-[640px] xl:min-h-[700px]">
      {/* Decorative stripe — tone-on-tone swirl behind the heading, same treatment as the reference */}
      {/* <svg
        className="pointer-events-none absolute -top-16 -left-16 w-[1400%] max-w-3xl h-auto opacity-60 lg:opacity-100"
        viewBox="0 0 600 560"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M40 420 C 160 340, 90 220, 220 150 C 340 90, 430 200, 360 270 C 290 340, 380 430, 520 400 C 600 382, 640 320, 630 260"
          stroke="#e3c895"
          strokeWidth="110"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
      </svg> */}
      <svg
        className="pointer-events-none absolute top-0 left-0 w-[250%] max-w-[1000px] h-auto opacity-60 lg:opacity-100"
        viewBox="0 0 500 600"
        fill="none"
        aria-hidden="true"
        xmlns="http://w3.org"
      >
        {/* Main tone-on-tone decorative swirl path with your exact color (#e3c895) */}
        <path
          d="M 80 440 
       C 140 380, 110 200, 240 160 
       C 370 120, 460 250, 390 310 
       C 320 370, 410 470, 550 410 
       C 620 380, 650 300, 630 220
       C 620 380, 650 300, 630 220
       C 620 380, 650 300, 630 220"
          stroke="#e3c895"
          strokeWidth="60"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
      </svg>


      <div className="relative z-10 max-w-7xl mx-auto px-13 sm:px-10 lg:px-14 flex flex-col lg:flex-row lg:h-full lg:min-h-[640px] xl:min-h-[700px]">
        {/* Text column */}
        <div className="relative z-10 flex flex-col justify-center gap-5 sm:gap-6 py-14 sm:py-16 lg:py-24 lg:w-[56%] lg:pr-10">
          {/* <h2 className="font-inter text-black uppercase text-[12vw] sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
            The{" "}
            <span className=" font-inter uppercase italic font-semibold text-black">
              Founder Devi
            </span>
          </h2> */}
          <h2 className="text-4xl md:text-5xl text-black font-inter uppercase">
            The {" "}
            <span className="relative z-0 inline-block font-semibold italic px-1">
              <span className="absolute bottom-1 left-0 right-0 h-[38%] bg-[#F7E5B5] -z-10" />
              Founder Devi
            </span>
          </h2>

          <div className="space-y-4 text-black font-inter text-lg sm:text-lg leading-relaxed max-w-3xl">
            <p className="italic font-semibold">
              “Selfcare starts the moment you borrow that first comb from your parents to comb your own hair.”

            </p>
            <p className="text-[18px] font-semibold italic ">
              My mom has been suffering from psoriasis since more than 28 years now and never have I ever been able to help her soothe. Indevie is my way of giving back to her and thousands of people suffering with irritated skin. Our products is an attempt to soothe any and every skin by blending ancient ayurveda and modern sciences.<br /> <strong className="text-black font-semibold"><br /> We call it Genurveda™, Ayurveda for Gen Next.  </strong>
            </p>
            {/* <p>
              So I set out to build Indévie, with a team devoted to clean, high-performing formulas that don&apos;t compromise on science, results, or integrity {" "}
              <strong className="text-[#241206] font-semibold">
                rooted in ancient Genurveda™ wisdom.
              </strong>
            </p> */}
          </div>

          <Link
            href="/about"
            className="inline-flex w-fit items-center bg-[#B40417] hover:bg-[#B40417]/80 transition-colors px-7 py-4 mt-2"
          >
            <span className="text-white font-inter font-semibold uppercase tracking-[0.1em] text-xs sm:text-sm">
              Know Our Story
            </span>
          </Link>

          <div className="pt-2">
            <p className="text-lg font-inter font-semibold text-[#241206]">
              Ar. Ishita Pathak
            </p>
            <p className="text-[14px] font-inter font-bold tracking-[0.2em] uppercase text-[#241206]/40">
              Founder, Indevie Beauty
            </p>
          </div>
        </div>

        {/* Image — mobile/tablet: normal flow below the text, shown at its
            original, undistorted proportions (no crop/zoom). */}
        <div className="relative z-10 flex justify-center lg:hidden pb-0 sm:pb-0">
          <div className="relative w-[100%] sm:w-[100%] max-w-xl aspect-[4.3/5.2]">
            <Image
              src="/images/ig-8.png"
              alt="Ar. Ishita Pathak, Founder of Indevie Beauty"
              fill
              className="object-contain object-bottom"
              sizes="(max-width: 1024px) 60vw, 0px"
            />
          </div>
        </div>
      </div>

      {/* Image — desktop: bleeds off the bottom edge of the section. Sized by a
          fixed height + locked aspect ratio (not a viewport-width percentage) so
          it keeps its original proportions and never grows past the section's
          own bounds on ultra-wide screens. */}
      <div className="hidden lg:block absolute bottom-0 right-[-4%] h-[660px] xl:h-[720px] aspect-[6/5] pointer-events-none">
        <Image
          src="/images/ig-8.png"
          alt="Ar. Ishita Pathak, Founder of Indevie Beauty"
          fill
          className="object-contain object-bottom"
          sizes="(min-width: 1024px) 480px, 0px"
        />
      </div>
    </section>
  );
}
