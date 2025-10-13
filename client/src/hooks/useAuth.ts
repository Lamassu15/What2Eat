import { useContext } from "react";
import { AuthContext } from "../context/AuhtContext";

export const useAuth = () => useContext(AuthContext);
