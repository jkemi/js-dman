.SUFFIXES:

NPMBIN=./node_modules/.bin
TSC=$(NPMBIN)/tsc
UJS=$(NPMBIN)/uglifyjs

all : release/dman.min.js release/dman.d.ts debug/dman.js release/dman.min.js.gz

doc: README.html

%.html : %.markdown
	@printf "[DOC] %-20s <- %s\n" $@ $<
	@markdown $< > $@

.PHONY: clean
clean :
	@echo "[CLEAN]"
	@rm release/*.min.* release/*.d.ts debug/* README.html 2>/dev/null || true

debug/%.js debug/%.d.ts: %.ts
	@printf  "[TSC]  %-20s <- %s\n" $@ $<
	@$(TSC) --declaration --out $@ $<

release/%.min.js : debug/%.js
	@printf  "[TSC]  %-20s <- %s\n" $@ $<
	@$(UJS) --comments -c -m -d RELEASE=true -o $@ $<

release/%.d.ts : debug/%.d.ts
	@printf "[CP]   %-20s <- %s\n" $@ $<
	@grep -v "^declare var RELEASE" $< > $@

%.min.js.gz : %.min.js
	@printf "[GZIP] %-20s <- %s\n" $@ $<
	@gzip -9 <$< >$@
