"use client"
import { motion } from "framer-motion"
import { type CSSProperties } from "react"
import { cn } from "../lib/cn"

type WordRevealProps = {
  /** Use `_word_` to italicise that word. */
  text: string
  className?: string
  style?: CSSProperties
  delay?: number
}

/**
 * Big serif headline reveal: each word slides up from below as the block
 * enters the viewport. Wrap parts of the text in underscores to italicise
 * them inline (e.g. `"Wear stories, not just _clothes_."`).
 */
export function WordReveal({ text, className, style, delay = 0 }: WordRevealProps) {
  const words = text.split(" ")

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={cn(className)}
      style={style}
    >
      {words.map((word, i) => {
        const html = word.replace(/_(.+?)_/g, "<em>$1</em>")
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-top"
            style={{ marginRight: "0.25em" }}
          >
            <motion.span
              variants={{
                hidden: { y: "110%" },
                visible: {
                  y: "0%",
                  transition: {
                    duration: 0.9,
                    ease: [0.2, 0.8, 0.2, 1],
                    delay: delay + i * 0.06,
                  },
                },
              }}
              className="inline-block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </span>
        )
      })}
    </motion.div>
  )
}
