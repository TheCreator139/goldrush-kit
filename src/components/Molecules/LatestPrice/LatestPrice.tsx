import { CardDetail } from "@/components/Shared";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    GRK_SIZES,
    DEFAULT_ERROR_MESSAGE,
} from "@/utils/constants/shared.constants";
import { None, Some, type Option } from "@/utils/option";
import { useGoldRush } from "@/utils/store";
import { type LatestPriceProps } from "@/utils/types/molecules.types";
import { type CardDetailProps } from "@/utils/types/shared.types";
import type { GoldRushResponse, Price } from "@covalenthq/client-sdk";
import { useEffect, useState } from "react";

export const LatestPrice: React.FC<LatestPriceProps> = ({ chain_name }) => {
    const { goldrushClient } = useGoldRush();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [maybeResult, setMaybeResult] = useState<Option<Price | null>>(None);

    useEffect(() => {
        (async () => {
            setMaybeResult(None);
            setErrorMessage(null);
            try {
                const { data, ...error } =
                    await goldrushClient.PricingService.getTokenPrices(
                        chain_name,
                        "USD",
                        "0x0000000000000000000000000000000000000000"
                    );
                if (error.error) {
                    throw error;
                }
                setMaybeResult(new Some(data[0].items[0]));
            } catch (error: GoldRushResponse<null> | any) {
                setErrorMessage(error?.error_message ?? DEFAULT_ERROR_MESSAGE);
                setMaybeResult(new Some(null));
                console.error(error);
            }
        })();
    }, [chain_name]);

    return (
        <Card className="flex w-full flex-col items-start gap-x-4 p-2">
            {maybeResult.match({
                None: () => (
                    <>
                        {Array(1)
                            .fill(null)
                            .map(() => (
                                <div key={Math.random()}>
                                    <Skeleton size={GRK_SIZES.LARGE} />
                                </div>
                            ))}
                    </>
                ),
                Some: (result) =>
                    errorMessage ? (
                        <p className="mt-4">{errorMessage}</p>
                    ) : result ? (
                        (
                            [
                                {
                                    heading: `${result.contract_metadata.contract_ticker_symbol} PRICE`,
                                    content: result.pretty_price,
                                },
                            ] as CardDetailProps[]
                        ).map((props) => (
                            <CardDetail
                                key={props.heading?.toString()}
                                {...props}
                            />
                        ))
                    ) : (
                        <></>
                    ),
            })}
        </Card>
    );
};
