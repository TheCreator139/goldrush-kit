import { Transactions } from "@/components/Shared";
import { DEFAULT_ERROR_MESSAGE } from "@/utils/constants/shared.constants";
import { type Option, None, Some } from "@/utils/option";
import { useGoldRush } from "@/utils/store";
import { type BlockTransactionsProps } from "@/utils/types/molecules.types";
import type { GoldRushResponse, Transaction } from "@covalenthq/client-sdk";
import { useEffect, useState } from "react";

export const BlockTransactions: React.FC<BlockTransactionsProps> = ({
    chain_name,
    block_height,
    actionable_transaction,
}) => {
    const { goldrushClient } = useGoldRush();

    const [maybeResult, setMaybeResult] =
        useState<Option<Transaction[] | null>>(None);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setMaybeResult(None);
            setErrorMessage(null);
            try {
                const { data, ...error } =
                    await goldrushClient.TransactionService.getTransactionsForBlock(
                        chain_name,
                        block_height,
                        {
                            noLogs: true,
                            withSafe: false,
                            quoteCurrency: "USD",
                        }
                    );
                if (error.error) {
                    throw error;
                }
                setMaybeResult(new Some(data.items));
            } catch (error: GoldRushResponse<null> | any) {
                setErrorMessage(error?.error_message ?? DEFAULT_ERROR_MESSAGE);
                setMaybeResult(new Some(null));
                console.error(error);
            }
        })();
    }, [chain_name, block_height]);

    return (
        <Transactions
            errorMessage={errorMessage}
            maybeResult={maybeResult}
            actionable_transaction={actionable_transaction}
        />
    );
};
