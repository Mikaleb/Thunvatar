DEPS:= chrome/ \
       chrome.manifest \
       chrome/content/ \
       chrome/content/gravatars.js \
       chrome/content/gravatars_col_overlay.xul \
       install.rdf

gravatars.xpi: ${DEPS}
	zip $@ ${DEPS}
