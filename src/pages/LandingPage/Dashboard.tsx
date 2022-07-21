import React from "react";
import {TransactionsPreview} from "../Transactions/Transactions";
import LedgerInfo from "../LedgerInfo/LedgerInfo";
import Typography from '@mui/material/Typography';
import DividerHero from '../../components/Divider';
import HeaderSearch from "../layout/Search";
import Box from '@mui/material/Box';

export default function Dashboard() {
  return (
    <Box>
      <Typography color="primary" variant="subtitle2" component="span" sx={{ mb:2 }}>Network</Typography>
      <Typography variant="h1" component="h1" gutterBottom>Aptos Explorer</Typography>
      <DividerHero />
      <HeaderSearch />    
      <LedgerInfo />
      <TransactionsPreview/>
    </Box>
  );
}
