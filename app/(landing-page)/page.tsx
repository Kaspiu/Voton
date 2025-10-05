import Footer from "./_components/footer";
import Heading from "./_components/heading";
import Heroes from "./_components/heroes";

const LandingPage = () => {
  return (
    <div className="bg-background cursor-default flex flex-col items-center text-primary w-full">
      <div className="flex flex-col items-center w-full">
        <Heading />
        <Heroes />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
