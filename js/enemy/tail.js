function EnemyTail(source, segment, end, offset, length, base, endOffset) {
	return {
		source: source,
		segment: segment,
		end: end,
		offset: offset,
		length: length,
		base: base,
		index: 0,
		prevX: -1,
		prevY: -1,
		maxIndex: offset * (length - 1) + base + endOffset,
		orientations: [],
		
		Draw: function() {
		
			if (this.orientations.length == this.maxIndex * 3) {
				canvas.save();
				ResetTransform(canvas);
				var j;
				for (var i = 0; i < this.length - 1; i++) {
					j = (this.index - i * this.offset - this.base + this.maxIndex) % this.maxIndex;
					canvas.translate(this.orientations[j * 3], this.orientations[j * 3 + 1]);
					canvas.rotate(this.orientations[j * 3 + 2]);
					canvas.drawImage(this.segment, -this.segment.width / 2, -this.segment.height / 2);
					ResetTransform(canvas);
				}
				j = this.index;
				canvas.translate(this.orientations[j * 3], this.orientations[j * 3 + 1]);
				canvas.rotate(this.orientations[j * 3 + 2]);
				canvas.drawImage(this.end, -this.end.width / 2, -this.end.height / 2);
				canvas.restore();
			}
		
			// Update the orientation array
			if (this.prevX != this.source.x || this.prevY != this.source.y) {
				this.orientations[this.index * 3] = source.x;
				this.orientations[this.index * 3 + 1] = source.y;
				this.orientations[this.index * 3 + 2] = source.angle;
				this.index = (this.index + 1) % this.maxIndex;
				this.prevX = this.source.x;
				this.prevY = this.source.y;
			}
		}
	};
}