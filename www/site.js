function getXHR(url, receiver, timeout) {
	var req = new XMLHttpRequest()
	if (!req) {
		receiver("No AJAX")
	}
	req.onreadystatechange = ()=>{
		if (req.readyState === XMLHttpRequest.DONE) {
			if (req.status === 200) {
				receiver(null, req.responseText)
			} else {
				receiver("HTTP Status: " + req.status)
			}
		}
	}
	if (timeout)
		req.timeout = timeout
	req.open('GET', url)
	req.send()
}

function getJSON(url, receiver) {
	getXHR(url, (err,data)=>{
		var json
		if (err) {
			setTimeout(()=>receiver(err))
			return
		}
		try {
			json = JSON.parse(data)
			// it's not safe to call receiver here directly. It could throw...
			setTimeout(()=>receiver(null, json))
		} catch (e) {
			receiver("JSON ParseError: " + e)
		}
	})
}

function toggleDrawer() {
	let e = document.querySelector('.mdl-layout')
	if (e) e.MaterialLayout.toggleDrawer()
}

class Player {
	constructor(el) {
		this.video = el
		if (Hls.isSupported()) {
			this.hls = new Hls()
		}

		// assumed to start with, changed as we discover otherwise
		this.onStreamEnd = ()=>{}
	}

	selectVideo(source) {
		this.video.src = source
		this.video.play()
	}

	selectStream(source) {
		if (this.hls)
			this.hlsTarget(source)
		else
			this.selectVideo(source)
	}

	setPoster(data) {
		this.video.poster = data
	}

	hlsTarget(source) {
		// this looks to be idempotent (more or less)
		if (!Hls.isSupported()) {
			this.video.src = source
		} else {
			this.hls.loadSource(source)
			this.hls.attachMedia(this.video)
			this.hls.on(Hls.Events.ERROR, (_, err) => this.hlsError(err))
			this.video.play()
		}
	}

	hlsError({type, details, fatal}) {
		console.log("Hls error", type, details, fatal)
		if (type === "networkError") {
			if (details === "levelLoadError" || details === "manifestLoadError") {
				setTimeout(()=>this.onStreamEnd())
			}
		}
	}
}

class Menu {
	constructor(el, linkClass, cb) {
		this.nav = el
		this.linkClass = linkClass
		this.links = []
		this.cb = cb

		// a listener with a bound 'this'
		let listener = data=>this.listener(data, this.cb)
		// use old form anonymous function to allow eventlistener to bind 'this'
		this.nav.addEventListener('click', function (data) {
			listener(data)
		}, true)
	}

	listener(data, cb) {
		function getElementIndex(node) {
			let index = 0
			while ( (node = node.previousElementSibling) ) index++
			return index
		}
		let index = getElementIndex(data.target)
		cb(index)
	}

	makeLink(text) {
		let html = `<a class=${this.linkClass} href="#">${text}</a>`
		return html
	}

	setLinks(links) {
		if (links && links.constructor === Array) {
			this.links = links
		} else {
			console.log("Bad links:", links)
			this.links = []
		}
		this.display()
	}

	display() {
		this.nav.innerHTML = this.links.map(
				x=>this.makeLink(x)
			).join("")
	}
}

class Site {
	constructor() {
		this.files = []
		this.stream = '/hls/live/index.m3u8'
		this.streamLink = document.querySelector('#streamLink')
		this.streamOnline = true // assumed to start, until demonstrated otherwise
		this.player = new Player(document.querySelector('video'))
		this.player.selectStream(this.stream)
		this.player.onStreamEnd = ()=>this.onStreamEnd()

		this.target = this.stream

		this.watchInterval

		this.vodMenu = new Menu(document.querySelector('#menu'), 'mdl-navigation__link', id=>this.openVod(id))

		this.streamLink.addEventListener('click', ()=>this.openStream())

		this.canvas = document.createElement('canvas')
		this.canvas.width = 854
		this.canvas.height = 480
	}

	linkText(file) {
		return new Date(file.mtime).toDateString()
	}

	watchForStream() {
		if (this.watchInterval) return

		this.watchInterval = setInterval(()=>this.checkForStream(), 1000*10)
	}

	checkForStream() {
		getXHR(this.stream, (err, data)=>{
			if (!err) {
				setTimeout(()=>this.streamFound())
			}
		}, 3000)
	}

	streamFound() {
		this.streamLink.text = "Live"
		this.streamOnline = true
		if (this.target === this.stream) {
			this.openStream()
		}
		clearInterval(this.watchInterval)
		this.watchInterval = undefined
	}

	openStream() {
		toggleDrawer()
		console.log("Open live stream")
		this.target = this.stream
		if (this.streamOnline) {
			this.showVid()
		} else {
			this.showStreamOffline()
		}
		this.player.selectStream(this.stream)
		this.player.setPoster(this.drawPoster('Live Stream', newDate().toDateString()))
	}

	onStreamEnd() {
		this.streamLink.text = "Stream Offline"
		this.streamOnline = false
		if (this.target === this.stream) {
			this.showStreamOffline()
		}
		this.watchForStream()
	}

	getFiles() {
		getJSON('/video/', (err, data)=>this.receiveFiles(err, data))
	}

	receiveFiles(err, files) {
		if (err)
			console.log(err)
		else {
			if (JSON.stringify(files) !== JSON.stringify(this.files)) {
				this.files = files
				let data = files.map(this.linkText)
				this.vodMenu.setLinks(data)
			}
		}
	}

	openVod(id) {
		toggleDrawer()
		this.showVid()
		this.target = id
		let file = this.files[id]
		let name = file.name
		console.log("Open VOD", name)
		this.player.selectVideo(`/video/${name}`)
		this.player.setPoster(this.drawPoster('Stream', this.linkText(file)))
	}

	showStreamOffline() {
		const vid = document.querySelector('#vid')
		const placeholder = document.querySelector('#nostream')

		vid.style.display = 'none'
		placeholder.style.display = 'block'
	}

	showVid() {
		const vid = document.querySelector('#vid')
		const placeholder = document.querySelector('#nostream')

		vid.style.display = 'block'
		placeholder.style.display = 'none'
	}

	drawPoster(text1, text2) {
		let ctx = this.canvas.getContext('2d')
		ctx.fillStyle = "#C5CAE9"

		ctx.fillRect(0,0, this.canvas.width, this.canvas.height)

		ctx.font = "48px roboto"
		ctx.textAlign = "center"
		ctx.fillStyle = "#212121"
		ctx.fillText(text1, this.canvas.width/2, this.canvas.height/2 - 32)
		ctx.fillText(text2, this.canvas.width/2, this.canvas.height/2 + 32)

		return this.canvas.toDataURL('image/png')
	}
}

function init() {
	window.site = new Site
	site.getFiles()
}
document.addEventListener('DOMContentLoaded', init);
