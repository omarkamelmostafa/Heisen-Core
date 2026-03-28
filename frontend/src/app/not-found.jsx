// frontend/src/app/not-found.jsx
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="h-full w-full">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left side - Content */}
        <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <h2 className="mb-6 text-5xl font-semibold">{t("title")}</h2>
          <h3 className="mb-1.5 text-3xl font-semibold">
            {t("subtitle")}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t("description")}
          </p>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-lg text-base shadow-sm"
          >
            {t("backHome")}
          </Link>
        </div>

        {/* Right side - Image */}
        <div className="relative max-h-screen w-full p-2 max-lg:hidden">
          <div className="h-full w-full rounded-2xl bg-black"></div>
          <Image
            src="/images/error-image.png"
            alt="404 illustration"
            width={406}
            height={406}
            className="absolute top-1/2 left-1/2 h-[clamp(260px,25vw,406px)] -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
