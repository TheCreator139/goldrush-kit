import { Address, Timestamp } from "@/components/Atoms";
import { CardDetail } from "@/components/Shared";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    GRK_SIZES,
    DEFAULT_ERROR_MESSAGE,
} from "@/utils/constants/shared.constants";
import { timestampParser } from "@/utils/functions";
import { None, Some, type Option } from "@/utils/option";
import { useGoldRush } from "@/utils/store";
import { type LatestTransactionsProps } from "@/utils/types/molecules.types";
import {
    calculatePrettyBalance,
    type Transaction,
    type GoldRushResponse,
} from "@covalenthq/client-sdk";
import { useEffect, useState } from "react";

export const LatestTransactions: React.FC<LatestTransactionsProps> = ({
    chain_name,
    actionable_address,
    actionable_transaction,
}) => {
    const { goldrushClient } = useGoldRush();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [maybeResult, setMaybeResult] =
        useState<Option<Transaction[] | null>>(None);

    useEffect(() => {
        (async () => {
            try {
                setMaybeResult(None);
                setErrorMessage(null);
                const { data: blockData, ...blockError } =
                    await goldrushClient.BaseService.getBlockHeightsByPage(
                        chain_name,
                        timestampParser(new Date(), "YYYY MM DD"),
                        "2100-01-01",
                        {
                            pageSize: 1,
                        }
                    );
                if (blockError.error) {
                    setErrorMessage(blockError.error_message);
                    throw blockError;
                }
                const latestBlock = blockData.items[0];
                const { data: txData, ...txError } =
                    await goldrushClient.TransactionService.getTransactionsForBlock(
                        chain_name,
                        latestBlock.height - 4,
                        {
                            noLogs: true,
                            quoteCurrency: "USD",
                            withSafe: false,
                        }
                    );
                if (txError.error) {
                    setErrorMessage(txError.error_message);
                    throw txError;
                }
                setMaybeResult(new Some(txData.items.slice(-5)));
            } catch (error: GoldRushResponse<null> | any) {
                setErrorMessage(error?.error_message ?? DEFAULT_ERROR_MESSAGE);
                setMaybeResult(new Some(null));
                console.error(error);
            }
        })();
    }, [chain_name]);

    return (
        <Card className="flex w-full flex-col px-4">
            {maybeResult.match({
                None: () =>
                    new Array(5).fill(null).map(() => (
                        <div
                            key={Math.random()}
                            className="grid grid-cols-2 border-b border-secondary-light py-4 last:border-b-0 dark:border-secondary-dark sm:grid-cols-3"
                        >
                            {Array(3)
                                .fill(null)
                                .map(() => (
                                    <Skeleton
                                        key={Math.random()}
                                        size={GRK_SIZES.LARGE}
                                    />
                                ))}
                        </div>
                    )),
                Some: (txs) =>
                    errorMessage ? (
                        <p className="col-span-5">{errorMessage}</p>
                    ) : txs ? (
                        txs.map(
                            ({
                                block_signed_at,
                                tx_hash,
                                from_address,
                                from_address_label,
                                to_address_label,
                                to_address,
                                value,
                                gas_metadata,
                                pretty_value_quote,
                            }) => (
                                <div
                                    key={tx_hash}
                                    className="grid grid-cols-2 items-center border-b border-secondary-light py-4 last:border-b-0 dark:border-secondary-dark sm:grid-cols-3"
                                >
                                    <CardDetail
                                        content={
                                            <p className="text-base">
                                                <Address
                                                    address={tx_hash}
                                                    actionable_address={
                                                        actionable_transaction
                                                    }
                                                />
                                            </p>
                                        }
                                        heading={
                                            <Timestamp
                                                timestamp={block_signed_at}
                                                defaultType="relative"
                                            />
                                        }
                                        wrapperClassName="flex flex-col-reverse"
                                    />

                                    <div>
                                        <CardDetail
                                            heading={<div>FROM</div>}
                                            content={
                                                <Address
                                                    label={from_address_label}
                                                    address={from_address}
                                                    actionable_address={
                                                        actionable_address
                                                    }
                                                />
                                            }
                                            wrapperClassName="flex gap-x-2"
                                        />
                                        <CardDetail
                                            heading={<div>TO</div>}
                                            content={
                                                <Address
                                                    label={to_address_label}
                                                    address={to_address}
                                                    actionable_address={
                                                        actionable_address
                                                    }
                                                />
                                            }
                                            wrapperClassName="flex gap-x-2"
                                        />
                                    </div>

                                    <CardDetail
                                        content={`${calculatePrettyBalance(
                                            Number(value),
                                            gas_metadata.contract_decimals
                                        )} ${gas_metadata.contract_ticker_symbol}`}
                                        heading={pretty_value_quote}
                                        wrapperClassName="flex flex-col-reverse hidden sm:block"
                                    />
                                </div>
                            )
                        )
                    ) : (
                        <></>
                    ),
            })}
        </Card>
    );
};
