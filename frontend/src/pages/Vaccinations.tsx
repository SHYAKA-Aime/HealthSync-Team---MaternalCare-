import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Vaccinations = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to My Children page since vaccinations are now per child
    navigate("/my-children");
  }, [navigate]);

  return null;
};

export default Vaccinations;
