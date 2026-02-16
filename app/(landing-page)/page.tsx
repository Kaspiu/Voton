import Footer from "./_components/footer";
import Heading from "./_components/heading";
import Features from "./_components/features";
import WhyVoton from "./_components/why-voton";

const LandingPage = () => {
  return (
    <div className="flex w-full flex-col items-center bg-background pt-24 text-primary dark:bg-[#1F1F1F]">
      <div className="flex flex-col items-center w-full">
        <Heading />
        <Features />
        <WhyVoton />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
