import Link from "next/link"
import { notFound } from "next/navigation"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { prisma } from "@/lib/db"
import { privatePageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"
export const metadata = privatePageMetadata("Payment not completed")

type Params = Promise<{ orderId: string }>
type SearchParams = Promise<{ reason?: string | string[] }>

export default async function PaymentFailedPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { orderId } = await params
  const query = await searchParams
  const rawReason = Array.isArray(query.reason) ? query.reason[0] : query.reason
  const reason = rawReason ? rawReason.slice(0, 220) : "Payment was not completed."

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orderNumber: true, total: true, paymentStatus: true },
  })
  if (!order) notFound()

  return (
    <main className="mx-auto flex min-h-[calc(100vh-70px)] max-w-[880px] flex-col justify-center px-4 py-20 md:px-8">
      <Eyebrow className="mb-4 block text-accent">Razorpay checkout</Eyebrow>
      <h1 className="font-display text-[clamp(54px,9vw,112px)] leading-none tracking-tight">
        Payment could not be completed.
      </h1>
      <p className="mt-6 max-w-[620px] text-base leading-7 text-ink-2">
        Your order #{order.orderNumber} is saved with payment status{" "}
        <span className="font-mono uppercase tracking-widest text-red-300">{order.paymentStatus}</span>.
        No money is marked as paid in SYRA until Razorpay verification succeeds.
      </p>

      <div className="mt-8 border border-line bg-bg-2 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Eyebrow className="mb-1 block">Amount</Eyebrow>
            <p className="font-display text-3xl">{priceFmt(order.total)}</p>
          </div>
          <div>
            <Eyebrow className="mb-1 block">Reason</Eyebrow>
            <p className="text-sm leading-6 text-ink-2">{reason}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/checkout"><Button>Retry payment</Button></Link>
        <Link href="/contact"><Button variant="ghost">Contact support</Button></Link>
        <Link href="/"><Button variant="ghost">Return home</Button></Link>
      </div>
    </main>
  )
}
