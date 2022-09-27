import React from "react";
import {Route, Routes} from "react-router-dom";
import LandingPage from "./pages/LandingPage/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";
import ExplorerLayout from "./pages/layout";
import TransactionPage from "./pages/Transaction/Index";
import AccountPage from "./pages/Account/Index";
import {NodeCheckerPage} from "./pages/NodeChecker/Index";
import {TransactionsPage} from "./pages/Transactions/Transactions";
import {GovernancePage} from "./pages/Governance/Proposals/Index";
import {ProposalPage} from "./pages/Governance/Proposal/Index";
import {CreateProposalPage} from "./pages/Governance/CreateProposal/Index";
import {ValidatorsPage} from "./pages/Validators/Index";
import {Staking} from "./pages/Governance/Stake/Index";
import BlockPage from "./pages/Block/Index";
import TokenPage from "./pages/Token/Index";

export default function ExplorerRoutes() {
  return (
    <ExplorerLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/node_checker" element={<NodeCheckerPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/proposals" element={<GovernancePage />} />
        <Route path="/proposals/:id" element={<ProposalPage />} />
        <Route path="/proposals/create" element={<CreateProposalPage />} />
        <Route path="/proposals/staking" element={<Staking />} />
        <Route path="/validators" element={<ValidatorsPage />} />
        <Route path="/txn">
          <Route path=":txnHashOrVersion" element={<TransactionPage />} />
        </Route>
        <Route path="/account">
          <Route path=":address" element={<AccountPage />} />
        </Route>
        <Route path="/block">
          <Route path=":height" element={<BlockPage />} />
        </Route>
        <Route path="/token">
          <Route path=":param" element={<TokenPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ExplorerLayout>
  );
}
