 const layouts = [
	{
		"name": "Package A (PHP 30.00)",
    "description": "2x2 4pcs, 1x1 4pcs",
		"aspectRatio": [1, 1],
		"printLayout": {
			"row1": {
				"col1": {
					"height": 2,
					"width": 2
				},
				"col2": {
					"height": 2,
					"width": 2
				},
			},
			"row2": {
				"col1": {
					"height": 2,
					"width": 2
				},
				"col2": {
					"height": 2,
					"width": 2
				},
			},
			"row3": {
				"col1": {
					"height": 1,
					"width": 1
				},
				"col2": {
					"height": 1,
					"width": 1
				},
				"col3": {
					"height": 1,
					"width": 1
				},
				"col4": {
					"height": 1,
					"width": 1
				}
			}
		}
	},
  {
		"name": "Package B (PHP 25.00)",
    "description": "4pcs 2x2 only",
		"aspectRatio": [1, 1],
		"printLayout": {
			"row1": {
				"col1": {
					"height": 2,
					"width": 2
				},
				"col2": {
					"height": 2,
					"width": 2
				},
			},
			"row2": {
				"col1": {
					"height": 2,
					"width": 2
				},
				"col2": {
					"height": 2,
					"width": 2
				},
			},

		}
	},
  {
		"name": "Package C (PHP 20.00)",
    "description": "2x2 2pcs, 1x1 4pcs",
		"aspectRatio": [1, 1],
		"printLayout": {
			"row1": {
				"col1": {
					"height": 2,
					"width": 2
				},
				"col2": {
					"height": 2,
					"width": 2
				},
			},
			"row3": {
				"col1": {
					"height": 1,
					"width": 1
				},
				"col2": {
					"height": 1,
					"width": 1
				},
        "col3": {
					"height": 1,
					"width": 1
				},
				"col4": {
					"height": 1,
					"width": 1
				},
			},
		}
	},
  {
		"name": "Package D (PHP 15.00)",
    "description": "8pcs 1x1 only",
		"aspectRatio": [1, 1],
		"printLayout": {

			"row1": {
				"col1": {
					"height": 1,
					"width": 1
				},
				"col2": {
					"height": 1,
					"width": 1
				},
        "col3": {
					"height": 1,
					"width": 1
				},
				"col4": {
					"height": 1,
					"width": 1
				},
			},
			"row2": {
				"col1": {
					"height": 1,
					"width": 1
				},
				"col2": {
					"height": 1,
					"width": 1
				},
        "col3": {
					"height": 1,
					"width": 1
				},
				"col4": {
					"height": 1,
					"width": 1
				},
			},
		}
	},
  {
		"name": "Passport Size (PHP 30.00)",
    "description": "6pcs Passport size photos",
		"aspectRatio": [1.37795, 1.77165],
		"printLayout": {

			"row1": {
				"col1": {
					"height": 1.77165,
					"width": 1.37795
				},
				"col2": {
					"height": 1.77165,
					"width": 1.37795
				},
        "col3": {
					"height": 1.77165,
					"width": 1.37795
				},
			},
			"row2": {
				"col1": {
					"height": 1.77165,
					"width": 1.37795
				},
				"col2": {
					"height": 1.77165,
					"width": 1.37795
				},
        "col3": {
					"height": 1.77165,
					"width": 1.37795
				},
			},
	
		}
	}
]

export default layouts;