import React from "react";
import {
  Row,
  Col,
  Form,
  Button
} from "react-bootstrap";

function FacilityCalculator() {

  return (
    <div className="gt-glass-card mt-4 p-4">

      <h3 className="text-warning">
        🏢 Corporate Infrastructure Ledger
      </h3>

      <p className="text-white-50">
        Log monthly facility-wide emissions
        (Servers, HVAC, Production).
      </p>

      <Row className="g-3">

        <Col md={4}>
          <Form.Control
            placeholder="Electricity (kWh)"
            className="bg-dark text-white"
          />
        </Col>

        <Col md={4}>
          <Form.Control
            placeholder="Server Cooling (L)"
            className="bg-dark text-white"
          />
        </Col>

        <Col md={4}>
          <Button
            variant="warning"
            className="w-100"
          >
            Log Monthly Total
          </Button>
        </Col>

      </Row>

      <div className="mt-4">

        <p className="text-white">
          Annual Forecast:
          <strong>
            {" "}
            142 Tons CO₂e
          </strong>
        </p>

        <div
          className="progress"
          style={{ height: "12px" }}
        >
          <div
            className="progress-bar bg-warning"
            style={{ width: "65%" }}
          ></div>
        </div>

      </div>

    </div>
  );
}

export default FacilityCalculator;