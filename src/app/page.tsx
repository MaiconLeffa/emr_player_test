"use client";
import Loadable from "@loadable/component";

const LoadableBuyButton = Loadable(() => import("./player"));

export default function Home() {
  return (
    <>
      <LoadableBuyButton />
    </>
  );
}
