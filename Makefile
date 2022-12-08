OUTPUT = Screenshot.alfredworkflow

all: clean build

clean:
	@rm -rf $(OUTPUT)

bump:
	@plutil -replace version -string $(VERSION) info.plist
	@git add info.plist
	@git commit -m "🔖 $(VERSION)" &> /dev/null || true

build: clean
	@zip $(OUTPUT) \
		icon.png \
		info.plist \
		license \
		readme.md \
		screenshot.js &> /dev/null

release: build
	@gh release create $(VERSION) \
		--title $(VERSION) \
		--generate-notes \
		$(OUTPUT)
