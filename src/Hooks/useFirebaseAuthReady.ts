import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Firebase/FirebaseAuth";

const useFirebaseAuthReady = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsReady(true);
            }
        });
        return () => unsubscribe();
    }, []);

    return isReady;
};

export default useFirebaseAuthReady;