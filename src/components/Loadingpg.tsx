import SyncLoader from "react-spinners/SyncLoader";

const Loadingpg = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <SyncLoader color="black" />
    </div>
  );
};

export default Loadingpg;
