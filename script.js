'use strict'
const canvas = document.getElementById('canvas_XYR')
const ctx = canvas.getContext('2d')
const forms = document.getElementById('forms')
const coord_X = document.getElementById('selectX')
const coord_Y = document.getElementById('textY')
const coord_R = document.getElementById('textR')
const resultTableBody = document.getElementById('resultTableBody')
const centerX = canvas.width / 2
const centerY = canvas.height / 2
const blueCol = '#4671f1'

let resultsCheckedObjects = []
const storage_name = 'results'

function pxPerWidthR(r) {
	return canvas.width / (2 * r + 10)
}

function getCorrectR() {
	const r = parseFloat(coord_R.value)
	if (isNaN(r) || r < 2 || r > 5) {
		return 5
	}
	return r
}

function XtoCanvas(x, R) {
	return centerX + x * pxPerWidthR(R)
}

function YtoCanvas(y, R) {
	return centerY - y * pxPerWidthR(R)
}

function drawCoordinate() {
	try {
		const r = getCorrectR()
		const scale = pxPerWidthR(r)
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		ctx.strokeStyle = blueCol
		ctx.fillStyle = blueCol
		ctx.beginPath()
		ctx.moveTo(centerX, centerY)
		ctx.arc(centerX, centerY, r * scale, Math.PI, 1.5 * Math.PI)

		ctx.lineTo(centerX + r * scale, centerY)
		ctx.lineTo(centerX + r * scale, centerY + (r / 2) * scale)
		ctx.lineTo(centerX, centerY + (r / 2) * scale)
		ctx.lineTo(centerX, centerY)
		ctx.closePath()
		ctx.fill()
		ctx.stroke()

		ctx.strokeStyle = '#000000'
		ctx.lineWidth = 1

		ctx.beginPath()
		ctx.moveTo(0, centerY)
		ctx.lineTo(canvas.width, centerY)
		ctx.stroke()

		ctx.beginPath()
		ctx.moveTo(centerX, canvas.height)
		ctx.lineTo(centerX, 0)
		ctx.stroke()

		ctx.fillStyle = 'black'
		ctx.font = '16px Arial'
		ctx.textBaseline = 'middle'

		ctx.fillText('y', centerX + 4, 10)
		ctx.fillText('x', canvas.width - 10, centerY - 10)

		ctx.fillText('R', centerX + 4, Math.abs(r) * scale)
		ctx.fillText('R/2', centerX + 4, Math.abs(r) * scale * 1.5)

		ctx.fillText('-R', Math.abs(r) * scale, centerY - 10)
		ctx.fillText('-R/2', Math.abs(r) * scale * 1.5, centerY - 10)

		ctx.fillText('R', centerX + Math.abs(r) * scale, centerY - 10)
		ctx.fillText('R/2', centerX + Math.abs(r) * scale * 0.5, centerY - 10)

		ctx.fillText('-R/2', centerX + 4, centerY + Math.abs(r) * scale * 0.5)

		ctx.fillText('-R', centerX + 4, centerY + Math.abs(r) * scale)
	} catch (err) {
		console.err('Ошибка:', err)
	}
}

function checkHit(x, y, r) {
	if (x <= 0 && y >= 0) {
		const dist = Math.sqrt(x ** 2 + y ** 2)
		if (dist <= r) return true
	}

	if (x >= 0 && y >= 0) {
		if (y <= -x + r && x <= r) return true
	}

	if (x >= 0 && y <= 0) {
		if (y >= -r / 2 && x <= r) return true
	}

	return false
}

async function validateForms() {
	if (coord_X.value == '') {
		alert('Переменная X не выбрана.')
		return false
	}

	const y = parseFloat(coord_Y.value)
	if (isNaN(y) || y < -5 || y > 3) {
		alert('Значение Y не корректно. Корректный промежуток: -5 ≤ y ≤ 3')
		return false
	}

	const r = parseFloat(coord_R.value)
	if (isNaN(r) || r < 2 || r > 5) {
		alert('Значение R не корректно. Корректный промежуток: 2 ≤ r ≤ 5')
		return false
	}
	return true
}

class checkedObject {
	constructor(num, x, y, r, hit, time) {
		this.num = num
		this.x = x
		this.y = y
		this.r = r
		this.hit = hit
		this.time = time
	}
}

function saveResultsLocalSt() {
	try {
		localStorage.setItem(storage_name, JSON.stringify(resultsCheckedObjects))
	} catch (err) {
		console.error('Ошибка сохранения объектов в LocalStorage:', err)
	}
}

function loadResults() {
	try {
		const storageObjects = localStorage.getItem(storage_name)
		if (storageObjects) {
			resultsCheckedObjects = JSON.parse(storageObjects)
		}
	} catch (err) {
		console.error('Ошибка загрузки объектов из LocalStorage:', err)
	}
}

function showResults() {
	let objectsHtml = ''

	for (let i = 0; i < resultsCheckedObjects.length; i++) {
		const obj = resultsCheckedObjects[i]
		objectsHtml += `
		<tr>
			<td>${obj.num}</td>
			<td>${obj.x}</td>
			<td>${obj.y}</td>
			<td>${obj.r}</td>
			<td>${obj.hit ? 'Да' : 'Нет'}</td>
			<td>${new Date(obj.time).toLocaleString('ru-RU')}</td>
		</tr>`
	}
	resultTableBody.innerHTML = objectsHtml
}

forms.addEventListener('submit', async function (event) {
	event.preventDefault()
	if (!(await validateForms())) return

	const x = parseFloat(coord_X.value)
	const y = parseFloat(coord_Y.value)
	const r = parseFloat(coord_R.value)
	drawCoordinate()

	const isHit = checkHit(x, y, r)
	const currentTime = new Date().toISOString()

	const newCheckObject = new checkedObject(resultsCheckedObjects.length + 1, x, y, r, isHit, currentTime)
	resultsCheckedObjects.push(newCheckObject)
	saveResultsLocalSt()
	showResults()
	drawPoint(x, y, r, isHit)
})

function drawPoint(x, y, r, isHit) {
	const X = XtoCanvas(x, r)
	const Y = YtoCanvas(y, r)

	ctx.beginPath()
	ctx.strokeStyle = 'black'
	ctx.lineWidth = Math.max(1, 0.02 * pxPerWidthR(r))
	ctx.arc(X, Y, Math.max(3, 0.1 * pxPerWidthR(r)), 0, Math.PI * 2)
	ctx.fillStyle = isHit ? '#00ff15' : '#ff0000'
	ctx.fill()
	ctx.stroke()
}

document.addEventListener('DOMContentLoaded', function () {
	drawCoordinate()
	loadResults()
	showResults()
})

document.getElementById('clearButton').addEventListener('click', async function () {
	resultsCheckedObjects = []
	await saveResultsLocalSt()
	loadResults()
	drawCoordinate()
	showResults()
})
