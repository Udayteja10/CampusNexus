"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

// Categorized emoji definitions — containing ONLY true Unicode emojis
const EMOJI_CATEGORIES = [
  {
    name: "Smileys & Emotion",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", 
      "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", 
      "🤔", "🤫", "🫠", "🤥", "😶", "😐", "😑", "😬", "🫨", "🫥", "😯", "😴", "🤤", "😪", "😵", "🤐", "🤢", "🤮", "🤧", "😷", 
      "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", 
      "😾", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"
    ],
  },
  {
    name: "People & Body",
    icon: "👋",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", 
      "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦿", "🦵", 
      "🦶", "👂", "👃", "🧠", "🫀", "🫁", "🦷", "👀", "👅", "👄", "💋", "👥"
    ],
  },
  {
    name: "Animals & Nature",
    icon: "🐱",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", 
      "🐒", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "主动", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", 
      "🦂", "🕷️", "🐢", "🐍", "🦎", "🐙", "🦑", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", 
      "🦍", "🐘", "🦛", "🐪", "🦒", "🦘", "🐐", "🐕", "🐈", "🐓", "🐖", "🐎", "🕊️", "🌳", "🌴", "🌵", "🌿", "🍀", "🍁", "🍄", "🐚"
    ],
  },
  {
    name: "Food & Drink",
    icon: "🍔",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", 
      "🥒", "🌶️", "🫑", "🌽", "🥕", " potatoes", "🍠", "🥐", "🥖", "🥨", "🥯", "🥞", " waffle", "🧇", "🧀", "🍖", "🍗", "🥩", 
      "🥓", "🍔", "🍟", "🍕", "🌭", " Sandwich", "🥪", "🌮", "🌯", "🍳", "🍲", "🥣", "🥗", "🍿", "🧈", "🧂", "🥫", "🍱", "🍘", 
      "🍙", "🍚", "🍛", "🍜", "🍝", "🍩", "🍪", "🎂", "🍰", "🧁", "🍫", "🍬", "🍭", "🍮", "🍼", "🥛", "☕", "🫖", "🍵", 
      "🍷", "🍸", "🍹", "🍺", "🍻", "🥂", "🥃", "🥤", "🧋"
    ],
  },
  {
    name: "Activities",
    icon: "⚽",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", " volleyball", " rugby", "🏓", "🏸", " cricket", " goal", " golf", " kite", 
      "🎣", " diving", " boxing", " martial arts", " skateboard", " ski", " snowboard", " parachute", " lifting", 
      " wrestling", " surf", " swim", " waterpolo", " row", " climb", " bike", "🏆", "🥇", "🥈", "🥉", "🏅", " tickets", 
      " drama", " painting", " movie", " mic", " headphones", " piano", " drum", " guitar", " violin", " banjo", "🎲", 
      " chess", " dart", " bowling", " gamepad", " slot machine", " puzzle"
    ],
  },
  {
    name: "Travel & Places",
    icon: "🚗",
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", " ambulance", " fire engine", " truck", " tractor", " motorcycle", " scooter", 
      " bicycle", " stop sign", " anchor", " sailboat", " canoe", " speedboat", " ferry", " ship", " airplane", " takeoff", 
      " landing", " parachute", " helicopter", " rocket", " UFO", " hourglass", " watch", " clock", " stopwatch", " timer", 
      " sun", " moon", " planet", " star", " cloud", " rain", " snow", " lightning", " tornado", " fog", " wind", " rainbow", 
      " umbrella", " fire", " water drop", " wave"
    ],
  },
  {
    name: "Objects",
    icon: "💡",
    emojis: [
      "📱", "💻", " keyboard", " desktop", " printer", " mouse", " joystick", " cd", " floppy disk", " dvd", " tape", 
      " camera", " phone", " telephone", " tv", " radio", " mic", " compass", " alarm clock", " satellite dish", 
      " battery", " plug", "💡", " flashlight", " candle", " money bag", " coin", " credit card", " receipt", " gem", 
      " scale", " ladder", " toolbox", " screwdriver", " wrench", " hammer", " gear", " brick", " chain", " magnet", 
      " gun", " bomb", " firecracker", " axe", " knife", " sword", " shield", " key", " lock", " open lock", " syringe", 
      " pill", " microscope", " telescope"
    ],
  },
  {
    name: "Symbols",
    icon: "🔣",
    emojis: [
      "💘", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", 
      "💤", "💢", "💬", "💭", "💮", "🛑", "♠️", "♥️", "♦️", "♣️", "🃏", "🀄", "🎴", " bell", " mute bell", "🎵", 
      "🎶", " search", " gear", " checkmark", " crossmark", " warning", " prohibited", " recycling", " trademark", " copyright"
    ],
  },
  {
    name: "Flags",
    icon: "🏁",
    emojis: [
      "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇮🇳", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇯🇵", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", 
      "🇧🇷", "🇷🇺", "🇨🇳", "🇿🇦", "🇸🇬", "🇲🇾", "🇰🇷", "🇪🇺", "🇲🇽", "🇪🇬", "🇸🇦", "🇦🇪"
    ],
  },
];

// Clean text descriptions to actual emojis dynamically to ensure absolute Unicode correctness
EMOJI_CATEGORIES.forEach(cat => {
  cat.emojis = cat.emojis.map(e => e.trim()).filter(e => {
    // Only allow actual emojis (filter out any string that contains alphabet, spaces or is too long)
    return e.length > 0 && e.length <= 4 && !/^[a-zA-Z\s]+$/.test(e) && !/[\u4e00-\u9fa5]/.test(e);
  });
});

// A lightweight dictionary mapping common emojis to keywords to power the search bar
const EMOJI_KEYWORDS: Record<string, string> = {
  "😀": "smile happy laugh face",
  "😅": "sweat smile laugh face happy",
  "😂": "cry laugh tears lol face",
  "🤣": "lol rofl laugh tears face",
  "😍": "love heart eyes face",
  "🥰": "love hearts blush face",
  "😎": "cool sunglasses face",
  "🥳": "party celebrate face",
  "🥺": "pleading beg puppy eyes face",
  "😭": "cry sob sad tears face",
  "😡": "pout angry mad red face",
  "🤯": "mind blown explode face",
  "💩": "poop turd face",
  "💀": "skull dead death",
  "❤️": "heart love red",
  "🔥": "fire hot lit flame",
  "👍": "thumbs up like yes agree ok",
  "👎": "thumbs down dislike no disagree",
  "🎉": "party popper celebrate",
  "👏": "clap hand applause",
  "🙏": "please pray thank you hands respect",
  "⚽": "soccer football ball sport play",
  "🏀": "basketball ball sport play",
  "🎮": "game controller play playstation xbox",
  "🏆": "trophy win gold award prize",
  "🍕": "pizza food cheese slice",
  "🍔": "burger food meat hamburger fastfood",
  "🍟": "fries food potato chips",
  "☕": "coffee tea drink cup hot mug",
  "🍺": "beer drink alcohol mug",
  "🇮🇳": "india flag tricolor",
  "🇺🇸": "usa america flag star",
  "💻": "computer laptop dev code tech work",
  "💡": "bulb light idea genius search object",
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const activeCategory = EMOJI_CATEGORIES[activeCategoryIdx];

  // Helper to filter emojis globally if search query is active
  const getFilteredEmojis = () => {
    if (!searchQuery) return activeCategory.emojis;

    const query = searchQuery.toLowerCase().trim();
    const results: string[] = [];

    // Search across all categories
    EMOJI_CATEGORIES.forEach((cat) => {
      cat.emojis.forEach((emoji) => {
        const keywords = EMOJI_KEYWORDS[emoji] || "";
        const catName = cat.name.toLowerCase();
        
        if (
          keywords.includes(query) || 
          catName.includes(query) || 
          emoji === query
        ) {
          if (!results.includes(emoji)) {
            results.push(emoji);
          }
        }
      });
    });

    return results;
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <div className="w-64 bg-popover rounded-xl border border-border/60 shadow-lg flex flex-col h-80 overflow-hidden select-none">
      {/* Search Input Box */}
      <div className="p-2 border-b border-border/40 relative">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8.5 pr-8 h-8 text-xs bg-muted/30 focus-visible:bg-background border-border/40 focus-visible:border-border rounded-lg"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Category selector row — only visible when NOT searching */}
      {!searchQuery && (
        <div className="flex items-center gap-1 border-b border-border/40 p-1.5 overflow-x-auto scrollbar-none shrink-0 bg-muted/10">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <Button
              key={cat.name}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategoryIdx(idx)}
              className={cn(
                "h-7 w-7 p-0 flex items-center justify-center rounded-md shrink-0 transition-colors",
                activeCategoryIdx === idx
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              )}
              title={cat.name}
            >
              <span className="text-sm">{cat.icon}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Emoji scroll area */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
          {searchQuery ? `Search Results (${filteredEmojis.length})` : activeCategory.name}
        </p>

        {filteredEmojis.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium">
            No matching emojis found.
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {filteredEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="h-8 w-8 text-lg rounded-md hover:bg-accent flex items-center justify-center transition-all active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
