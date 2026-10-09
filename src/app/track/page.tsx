import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order — Ember Dust",
  description:
    "Check live dispatch status, courier consignment tracking, and order history for your Ember Dust pure wood ash order.",
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
