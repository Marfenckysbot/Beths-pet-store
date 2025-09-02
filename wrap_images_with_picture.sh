#!/usr/bin/env bash
set -e
shopt -s nullglob

# Work on each .html in the current directory
for f in *.html; do
  cp "$f" "$f.bak"                 # backup
  perl -0777 -pe '
    # Replace <img ... src="images/...(.jpg|jpeg|png|webp)" ...>
    s{<img([^>]*?)\s+src=(["\'])(images/([^"\']+))\.(jpg|jpeg|png|webp)\2([^>]*?)\/?>}{
      my($pre,$q,$path,$name,$ext,$post)=($1,$2,$3,$4,$5,$6);
      my $orig = "$path.$ext";
      my $webp = "$path.webp";
      # If original src already .webp, fallback to .jpg (safe)
      my $fallback = ($ext =~ /webp/i) ? "$path.jpg" : $orig;
      # Keep any attributes (pre and post), add loading/decoding to img
      my $img_tag = "<img$pre src=\"".$fallback."\"".$post." loading=\"lazy\" decoding=\"async\" />";
      "<picture><source srcset=\"$webp\" type=\"image/webp\">".$img_tag."</picture>";
    }gsexi' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
