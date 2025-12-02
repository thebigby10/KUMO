
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Link href={"/editor-page"}>Go to Editor Page</Link>
      </div>
    </>
  );
}
