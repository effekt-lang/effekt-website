LATEX = pdflatex
DVITEX = latex
DVISVG = dvisvgm

SRC = $(wildcard src-*.tex)

.PHONY: all clean

all: image.pdf image.svg

image.pdf: $(SRC) macros.tex image.tex
	$(LATEX) image.tex

image.svg: $(SRC) macros.tex image.tex
	$(DVITEX) image.tex
	$(DVISVG) --output=image.svg --no-fonts image.dvi

clean:
	@find . -name "*.aux" -type f -delete
	@find . -name "*.bbl" -type f -delete
	@find . -name "*.blg" -type f -delete
	@find . -name "*.dvi" -type f -delete
	@find . -name "*.log" -type f -delete
	@find . -name "*.out" -type f -delete
	@find . -name "*.toc" -type f -delete
	@find . -name "*.pdf" -type f -delete
	@find . -name "*.svg" -type f -delete
	@echo "Deleted .aux .bbl .blg .dvi .log .out .toc .pdf .svg files."
