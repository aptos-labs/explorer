import {Types} from "aptos";

export const BLOCK_DUMMY_DATA: {
  block_height: string;
  block_hash: string;
  block_timestamp: string;
  first_version: string;
  last_version: string;
  transactions?: Types.Transaction_BlockMetadataTransaction[] | undefined;
} = {
  block_height: "821263",
  block_hash: "string",
  block_timestamp: "32425224034",
  first_version: "40454965",
  last_version: "40454970",
  transactions: [
    {
      version: "40454965",
      hash: "0x198ffe752e19d2ce4617b48af59af575ad69fc6d97a24c27271af8c852d0855d",
      state_root_hash:
        "0xd2cbf9be65423989fa9d1f15cb94b8edfbe3fb023291b937b7ba6e7818c5a381",
      event_root_hash:
        "0x8bae94ce947e28e3c425c9c50f3735423b3bff919e5c8e50554d144c9a37f6aa",
      gas_used: "0",
      success: true,
      vm_status: "Executed successfully",
      accumulator_root_hash:
        "0xa61cc84f15df345f22ed44211a31f4248d261101fb0674d4d97b6dcc0ecbcca2",
      changes: [],
      id: "0x4a4aa536a980233d9ff92bbdecb02630153ce5095016764d1177ba218261a694",
      epoch: "113",
      round: "7966",
      events: [
        {
          key: "0x03000000000000000000000000000000000000000000000000000000000000000000000000000001",
          sequence_number: "11162893",
          type: "0x1::block::NewBlockEvent",
          data: {
            epoch: "113",
            failed_proposer_indices: [],
            hash: "0x4a4aa536a980233d9ff92bbdecb02630153ce5095016764d1177ba218261a694",
            height: "11162893",
            previous_block_votes_bitvec: "0xfcf04c",
            proposer:
              "0x952b6ca0c2fe60c6cfb440d3744cb471a261dbccd0c82fe048ea70d79d44d3ce",
            round: "7966",
            time_microseconds: "1663369269745855",
          },
        },
      ],
      previous_block_votes_bitvec: [252, 240, 76],
      proposer:
        "0x952b6ca0c2fe60c6cfb440d3744cb471a261dbccd0c82fe048ea70d79d44d3ce",
      failed_proposer_indices: [],
      timestamp: "1663369269745855",
      type: "block_metadata_transaction",
    },
  ],
};
