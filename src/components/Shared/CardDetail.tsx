import { type CardDetailProps } from "@/utils/types/shared.types";
import { CardContent, CardDescription } from "../ui/card";

export const CardDetail: React.FC<CardDetailProps> = ({
    content = null,
    heading = null,
    subtext = null,
    wrapperClassName = "",
}) => {
    return (
        <div className={wrapperClassName}>
            <CardDescription>{heading}</CardDescription>

            <CardContent className="flex items-center gap-x-2">
                {content}{" "}
                {subtext ? <CardDescription>{subtext}</CardDescription> : <></>}
            </CardContent>
        </div>
    );
};
