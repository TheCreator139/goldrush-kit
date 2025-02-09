import { NFTWalletCollectionView as NFTWalletCollectionViewComponent } from "./NFTWalletCollectionView";
import { storyAction } from "@/utils/functions";
import { type Meta, type StoryObj } from "@storybook/react";

type Story = StoryObj<typeof NFTWalletCollectionViewComponent>;

const meta: Meta<typeof NFTWalletCollectionViewComponent> = {
    title: "Organisms/NFT Wallet Collection View",
    component: NFTWalletCollectionViewComponent,
};

export default meta;

export const NFTWalletCollectionView: Story = {
    args: {
        chain_name: "eth-mainnet",
        address: "0x1ae705a28f1cca0363b5d709159220aa2fe551de",
        actionable_address: (address: string) => storyAction(address),
    },
};
