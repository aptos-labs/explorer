import {createContext, useContext, useState} from "react";
import {AIP141_CONFIG} from "../utils/aip140";

type AIP140ContextType = {
  showWarnings: boolean;
  setShowWarnings: (show: boolean) => void;
};

const AIP140Context = createContext<AIP140ContextType>({
  showWarnings: false,
  setShowWarnings: () => {},
});

export function AIP140Provider({
  children,
  defaultEnabled = false,
}: {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}) {
  const [showWarnings, setShowWarnings] = useState(
    AIP141_CONFIG.enabled && defaultEnabled,
  );

  return (
    <AIP140Context.Provider value={{showWarnings, setShowWarnings}}>
      {children}
    </AIP140Context.Provider>
  );
}

export function useAIP140Warnings(): AIP140ContextType {
  return useContext(AIP140Context);
}
