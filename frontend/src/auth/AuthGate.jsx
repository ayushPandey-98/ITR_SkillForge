import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

export default function AuthGate({ children }) {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const result = await axios.get(serverUrl + "/api/user/currentuser", {
          withCredentials: true,
        });
        if (!cancelled) dispatch(setUserData(result.data));
      } catch (e) {
        if (!cancelled) dispatch(setUserData(null));
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const content = useMemo(() => {
    if (checking) return null;
    return children;
  }, [checking, children]);

  return content;
}

