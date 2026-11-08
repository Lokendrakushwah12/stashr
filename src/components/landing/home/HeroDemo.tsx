"use client";

import {
  Avatar,
  Bar,
  BrandMark,
  Collapse,
  Count,
  Stage,
  Text,
  Window,
  type Act,
} from "@/components/landing/stageshow/kit";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import "./hero-demo.css";

// Stashr's hero: a note written in a board, a pasted link becoming a chip,
// ⌘↵ posting it, and the details column taking in the link and the activity.
//
//   Beat                                   Payoff
//   1  click the composer                  the caret is in the note
//   2  type a list, paste a link           the URL lands as a Google Docs chip
//   3  ⌘↵                                  the note joins the timeline
//   4  (the system)                        Links 1 → 2, "You added a note"
//
// Real strings: the board name, two list items, two chips, two activity
// rows. Everything else is filler.

type S = {
  focus: boolean;
  item1: string;
  line2: boolean;
  item2: string;
  chip: boolean;
  posted: boolean;
};

const initial: S = {
  focus: false,
  item1: "",
  line2: false,
  item2: "",
  chip: false,
  posted: false,
};
const POSTER: S = {
  focus: false,
  item1: "Ship the landing page",
  line2: true,
  item2: "Copy:",
  chip: true,
  posted: true,
};

// Desktop only: the page shows a static screenshot below md instead.
const REST = { x: 560, y: 360 };

async function script(a: Act<S>) {
  await a.wait(700);
  await a.click("composer");
  await a.set({ focus: true });
  await a.wait(250);
  await a.type("item1", "Ship the landing page");
  await a.wait(200);
  await a.key("enter");
  await a.set({ line2: true });
  await a.type("item2", "Copy:");
  await a.wait(250);
  await a.key("cmd+v");
  await a.set({ chip: true });
  await a.wait(700);
  await a.key("cmd+enter");
  await a.set({ posted: true, focus: false });
  await a.move("rest");
  await a.wait(2600);
  // The note was posted for real, so the loop starts a fresh draft: the
  // board resets with the composer, under a short fade.
  await a.set({ ...initial });
  await a.wait(500);
}

function DocsChip() {
  return (
    <span className="sh-chip">
      <BrandMark brand="google-docs" size={14} tile={false} />
      <Text>docs.google.com/launch-copy</Text>
    </span>
  );
}

function FigmaChip() {
  return (
    <span className="sh-chip">
      <BrandMark brand="figma" size={14} tile={false} />
      <Text>figma.com/file/moodboard</Text>
    </span>
  );
}

function Note({ s }: { s: S }) {
  return (
    <ol className="sh-list">
      <li>
        <span className="sh-num">1.</span>
        <Text>{s.item1 || " "}</Text>
      </li>
      {s.line2 ? (
        <li>
          <span className="sh-num">2.</span>
          <Text>{s.item2}</Text>
          {s.chip ? <DocsChip /> : null}
        </li>
      ) : null}
    </ol>
  );
}

function Entry({
  name,
  when,
  children,
}: {
  name: string;
  when: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sh-entry">
      <div className="sh-entry-head">
        <Avatar name={name} size={22} />
        <Text className="sh-entry-name">{name}</Text>
        <Text className="sh-faint">{when}</Text>
      </div>
      <div className="sh-entry-body">{children}</div>
    </div>
  );
}

export default function HeroDemo() {
  // Light on the server and first render (they must match), then the page's
  // theme once mounted.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const theme = mounted && resolvedTheme === "dark" ? "dark" : "light";
  return (
    <Stage<S>
      theme={theme}
      width={1000}
      height={440}
      initial={initial}
      poster={POSTER}
      script={script}
      cursor={{ at: REST }}
      className="sh"
    >
      {(s) => (
        <>
          <Window url="stashr.in/board/launch-plan" className="sh-window">
            <div className="sh-board">
              <div className="sh-main">
                <div className="sh-title">
                  <span className="sh-icon" aria-hidden>
                    🚀
                  </span>
                  <span>Launch plan</span>
                </div>

                <Entry name="Maya" when="2h">
                  <ol className="sh-list">
                    <li>
                      <span className="sh-num">1.</span>
                      <Text>Moodboard:</Text>
                      <FigmaChip />
                    </li>
                  </ol>
                </Entry>

                <Collapse open={s.posted}>
                  <Entry name="You" when="now">
                    <Note s={POSTER} />
                  </Entry>
                </Collapse>

                {/* Like the app: posting closes the composer, the note takes its place. */}
                <Collapse open={!s.posted}>
                  <div
                    className="sh-composer"
                    data-target="composer"
                    data-cursor="ibeam"
                    data-focus={s.focus || undefined}
                  >
                    {/* Both stay mounted and crossfade, so nothing pops. */}
                    <div className="sh-draft">
                      <Text
                        className="sh-placeholder"
                        data-show={!s.focus || undefined}
                      >
                        Add a note…
                      </Text>
                      <div
                        className="sh-draft-note"
                        data-show={s.focus || undefined}
                      >
                        <Note s={s} />
                      </div>
                    </div>
                    <div className="sh-composer-foot">
                      <Bar w={72} h={6} tone={2} />
                      <span
                        className="sh-send"
                        data-on={s.chip && !s.posted ? true : undefined}
                      />
                    </div>
                  </div>
                </Collapse>
              </div>

              <aside className="sh-side">
                <div className="sh-section">
                  <div className="sh-section-title">
                    Links{" "}
                    <Count value={s.posted ? 2 : 1} className="sh-count" />
                  </div>
                  <Collapse open={s.posted}>
                    <div className="sh-side-row">
                      <DocsChip />
                    </div>
                  </Collapse>
                  <div className="sh-side-row">
                    <FigmaChip />
                  </div>
                </div>
                <div className="sh-section">
                  <div className="sh-section-title">Activity</div>
                  <Collapse open={s.posted}>
                    <div className="sh-act">
                      <Avatar name="You" size={18} />
                      <span className="sh-act-text">
                        <b>You</b> added a note
                      </span>
                      <Text className="sh-faint">now</Text>
                    </div>
                  </Collapse>
                  <div className="sh-act">
                    <Avatar name="Maya" size={18} />
                    <span className="sh-act-text">
                      <b>Maya</b> added a note
                    </span>
                    <Text className="sh-faint">2h</Text>
                  </div>
                  <div className="sh-act" aria-hidden>
                    <Bar w={18} h={18} r={9} tone={2} />
                    <Bar w={110} h={6} tone={2} />
                    <Bar w={16} h={6} tone={2} />
                  </div>
                </div>
              </aside>
            </div>
          </Window>
          <span
            data-target="rest"
            style={{ position: "absolute", left: REST.x, top: REST.y }}
          />
        </>
      )}
    </Stage>
  );
}
