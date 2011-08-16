.SUFFIXES:

all : release/dman-min.js debug/dman-dbg.js release/dman-min.js.gz

.PHONY: clean
clean :
	rm release/*-min.* debug/*-dbg.*

release/%-rel.js : %.js Makefile
	cpp -undef -P -C -DNDEBUG -UDEBUG ${DEFINES} -o $@ $<

debug/%-dbg.js : %.js Makefile
	cpp -undef -P -C -DDEBUG -UNDEBUG ${DEFINES} -o $@ $<

%-min.js : %-rel.js Makefile
	yui-compressor --type js --charset UTF-8 --line-break 100 -o $@ $<

%-min.js.gz : %-min.js
	gzip -9 <$< >$@
