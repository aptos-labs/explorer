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
import {Create, EditOperator, EditVoter} from "./pages/Governance/Stake/Index";

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/proposals" element={<GovernancePage />} />
        <Route path="/proposals/:handle/:id" element={<ProposalPage />} />
        <Route path="/proposals/create" element={<CreateProposalPage />} />
        <Route path="/proposals/staking" element={<Create />} />
        <Route
          path="/proposals/stake/edit/operator"
          element={<EditOperator />}
        />
        <Route path="/proposals/stake/edit/voter" element={<EditVoter />} />
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
