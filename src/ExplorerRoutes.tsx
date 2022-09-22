import React from "react";
import {Route, Routes} from "react-router-dom";
import LandingPage from "./pages/LandingPage/Index";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorerLayout from "./pages/layout";
import {ProposalPage} from "./pages/Proposal/Index";
import {CreateProposalPage} from "./pages/CreateProposal/Index";
import {Staking} from "./pages/Stake/Index";

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/proposal/:id" element={<ProposalPage />} />
        <Route path="/proposal/create" element={<CreateProposalPage />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ExplorerLayout>
  );
}
