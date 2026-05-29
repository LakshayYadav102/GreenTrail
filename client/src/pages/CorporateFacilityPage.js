import React from "react";

import CorporateNavbar from "../components/corporate/CorporateNavbar";
import FacilityCalculator from "../components/corporate/FacilityCalculator";

function CorporateFacilityPage() {

  return (
    <div className="gt-dashboard-page">

      <CorporateNavbar />

      <div className="container py-5">
        <FacilityCalculator />
      </div>

    </div>
  );
}

export default CorporateFacilityPage;