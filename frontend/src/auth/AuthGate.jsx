import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";

export default function AuthGate({ children }) {
  const { userData } = useSelector((state) => state.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        await axios.get(serverUrl + "/api/user/currentuser", {
          withCredentials: true,
        });
      } catch (e) {
        // ignore - userData will remain null
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (checking) return null;
    return children;
  }, [checking, children]);

  return content;
}

