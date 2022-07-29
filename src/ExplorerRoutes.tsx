import React from "react";
import {Route, Routes} from "react-router-dom";
import LandingPage from "./pages/LandingPage/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorerLayout from "./pages/layout";
import TransactionPage from "./pages/Transactions/Transaction";
import AccountPage from "./pages/Accounts/Account";
import {TransactionsPage} from "./pages/Transactions/Transactions";
import {GovernancePage} from "./pages/Governance/Proposals/Index";
import {ProposalPage} from "./pages/Governance/Proposal/Index";
import {CreateProposalPage} from "./pages/Governance/CreateProposal/Index";

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/proposals" element={<GovernancePage />} />
        <Route path="proposals/:id" element={<ProposalPage />} />
        <Route path="/proposals/create" element={<CreateProposalPage />} />
        <Route path="/txn">
          <Route path=":txnHashOrVersion" element={<TransactionPage />} />
        </Route>
        <Route path="/account">
          <Route path=":address" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ExplorerLayout>
  );
}
