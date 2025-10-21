import Footer from "./_components/footer";
import Heading from "./_components/heading";
import Heroes from "./_components/heroes";

const LandingPage = () => {
  return (
    <div className="flex w-full flex-col items-center bg-background pt-24 text-primary cursor-default dark:bg-[#1F1F1F]">
      <div className="flex flex-col items-center w-full">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
