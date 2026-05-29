import React from "react";
import {
  Table,
  Badge,
  Button
} from "react-bootstrap";

function VerificationHub({
  employees,
  onUpdateCredibility
}) {

  return (
    <div className="gt-glass-card mt-4 p-4">

      <h3 className="text-white mb-4">
        🛡️ Auditor Verification Hub
      </h3>

      <Table
        striped
        bordered
        hover
        variant="dark"
        responsive
      >
        <thead>
          <tr>
            <th>Employee</th>
            <th>Credibility Score</th>
            <th>Verification</th>
            <th>Pending Proofs</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {employees.map((emp) => (

            <tr key={emp._id}>

              <td>{emp.username}</td>

              <td>
                <Badge
                  bg={
                    emp.credibilityScore > 3.5
                      ? "success"
                      : emp.credibilityScore > 2
                      ? "warning"
                      : "danger"
                  }
                >
                  {emp.credibilityScore} / 5
                </Badge>
              </td>

              <td>
                {emp.isVerifiedByAuditor ? (
                  <Badge bg="success">
                    Verified
                  </Badge>
                ) : (
                  <Badge bg="secondary">
                    Pending
                  </Badge>
                )}
              </td>

              <td>
                <Button
                  size="sm"
                  variant="outline-light"
                >
                  View Bills
                </Button>
              </td>

              <td>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() =>
                    onUpdateCredibility(
                      emp._id,
                      0.5
                    )
                  }
                >
                  Approve
                </Button>
              </td>

            </tr>

          ))}

        </tbody>
      </Table>
    </div>
  );
}

export default VerificationHub;