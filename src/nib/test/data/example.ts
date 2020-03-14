export const dataExample:any = {
	a: {
		kind: 'root',
		nodes: [{
			key: 1,
			kind: 'blk',
			type: 'p',
			nodes:[
				{
					key: 2,
					kind: 'blk',
					type: 'p',
					nodes:[
						{
							key: 3,
							kind: 'blk',
							type: 'p',
							nodes:[
								{
									text: ''
								}
							]
						}
					]
				}
			]
		}]
	},
	b: [{
		key: 0,
		kind: 'blk',
		type: 'p',
		nodes:[]
	},{
		key: 1,
		kind: 'blk',
		type: 'p',
		nodes:[
			{
				key: 2,
				kind: 'blk',
				type: 'p',
				nodes:[
					{
						key: 3,
						kind: 'blk',
						type: 'p',
						nodes:[
							{
								key: 4,
								kind: 'blk',
								type: 'p',
								nodes:[
									{
										text: '4 - 0'
									},{

										text: '4 - 1'
									},{

										text: '4 - 2'
									}
								]
							},{
								key: 5,
								kind: 'blk',
								type: 'p',
								nodes:[
									{
										text: '5 - 0'
									},{

										text: '5 - 1'
									}
								]
							}
						]
					},{
						key: 6,
						kind: 'blk',
						type: 'p',
						nodes:[
							{
								text: '6 - 0'
							}
						]
					},{
						key: 7,
						kind: 'blk',
						type: 'p',
						nodes:[
							{
								text: '7 - 0'
							}
						]
					}
				]
			}
		]
	},{
		key: 8,
		kind: 'blk',
		type: 'p',
		nodes:[
			{
				text: '8 - 0',
				attr:{
					bold: true
				}
			},{
				text: '8 - 1',
				attr:{
					bold: true
				}
			}
		]
	}],
	c: {
		kind: 'root',
		nodes:[{
			kind:'blk',
			type:'p',
			nodes: [{
				kind: 'inl',
				type: 'text',
				nodes: [{
					format: {
						bold: true,
						italic: true,
						underline: true
					},
					text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
				},{
					format: {
						bold:true
					},
					text: 'Maecenas in ultricies sapien. Proin quis sapien velit.'
				},{
					format: {
						color: 'red'
					},
					text:  'Nullam nisi velit, cursus id enim sit amet, mattis vulputate libero. Vivamus hendrerit, quam sit amet dictum dapibus, lorem enim laoreet mauris, quis blandit elit risus quis elit.'
				}]
			}]
		}]
	}
}