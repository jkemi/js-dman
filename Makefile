.SUFFIXES:

all : release/dman-min.js debug/dman-dbg.js release/dman-min.js.gz

doc: README.html

%.html : %.markdown
	markdown $< > $@

.PHONY: clean
clean :
	rm release/*-min.* debug/*-dbg.* README.html

release/%-rel.js : %.js
	cpp -undef -P -C -DNDEBUG -UDEBUG ${DEFINES} -o $@ $<

debug/%-dbg.js : %.js
	cpp -undef -P -C -DDEBUG -UNDEBUG ${DEFINES} -o $@ $<

%-min.js : %-rel.js
	head -n 5 $< > $@
	yui-compressor --type js --charset UTF-8 --line-break 100 $< >> $@

%-min.js.gz : %-min.js
	gzip -9 <$< >$@
