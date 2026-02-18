import Features from "./_components/features";
import Heading from "./_components/heading";
import WhyVoton from "./_components/why-voton";

const LandingPage = () => {
  return (
    <div className="flex w-full flex-col items-center bg-background pt-24 text-primary dark:bg-[#1F1F1F]">
      <Heading />
      <Features />
      <WhyVoton />
    </div>
  );
};

export default LandingPage;
