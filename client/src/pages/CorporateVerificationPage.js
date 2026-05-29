// import React, {
//   useEffect,
//   useState
// } from "react";

// import api from "../services/api";

// import CorporateNavbar from "../components/corporate/CorporateNavbar";
// import VerificationHub from "../components/corporate/VerificationHub";

// function CorporateVerificationPage() {

//   const [employees, setEmployees] = useState([]);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get(
//         "/corporate/employees"
//       );

//       setEmployees(res.data);

//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const updateCredibility = async (
//     userId,
//     increment
//   ) => {
//     try {

//       await api.put(
//         `/corporate/update-credibility/${userId}`,
//         {
//           increment
//         }
//       );

//       fetchEmployees();

//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="gt-dashboard-page">

//       <CorporateNavbar />

//       <div className="container py-5">
//         <VerificationHub
//           employees={employees}
//           onUpdateCredibility={
//             updateCredibility
//           }
//         />
//       </div>

//     </div>
//   );
// }

// export default CorporateVerificationPage;