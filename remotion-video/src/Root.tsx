import "./index.css";
import { Composition } from "remotion";
import { GISComparison } from "./GISVisualization/GISComparison";
import { NullIsland } from "./GISVisualization/NullIsland";
import { OpeningScene } from "./GISVisualization/OpeningScene";
import { CurrencyExchangeScene } from "./GISVisualization/CurrencyExchangeScene";
import { GeoreferencingScene } from "./GISVisualization/GeoreferencingScene";
import { ProjectRasterScene } from "./GISVisualization/ProjectRasterScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProjectRasterScene"
        component={ProjectRasterScene}
        durationInFrames={1900}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="GeoreferencingScene"
        component={GeoreferencingScene}
        durationInFrames={2662}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="CurrencyExchangeScene"
        component={CurrencyExchangeScene}
        durationInFrames={3450}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="OpeningScene"
        component={OpeningScene}
        durationInFrames={3000}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="GISComparison"
        component={GISComparison}
        durationInFrames={6752}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="NullIsland"
        component={NullIsland}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
