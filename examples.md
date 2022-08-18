---
layout: docs
title:  "Examples"
---

# Examples

This is a loose (and unmaintained) collection of examples illustrating different aspects of the language.
{% assign sorted = site.examples | sort: 'date' | reverse %}
{% for ex in sorted %}
  - [{{ ex.title }}]({{ex.url}}) _({{ ex.date | date: "%b %d, %Y" }})_
{% endfor %}
