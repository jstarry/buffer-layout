# buffer-layout

buffer-layout is a utility module implemented in pure JavaScript that
supports translations between JavaScript values and Buffers.  It is made
available under the MIT license.

Layout support is provided for these types of data:

* Signed and unsigned integral values from 1 to 6 bytes in length, in
  little-endian or big-endian format;
* Float and double values (also little-endian or big-endian);
* Structures with named fields containing arbitrary layouts;
* Sequences of up to a fixed number of instances of an arbitrary layout
* Unions of variant layouts where the type of data is recorded in a
  prefix value.

## Installation

Development and testing is done using Node.js, supporting versions 0.12
and later.  Install with `npm install buffer-layout`.

## Usage

Assume you have a sensor that records environmental data using the
following (packed) C structure:

    struct reading {
      uint8_t sensor_id;
      int16_t T_Cel;
      uint16_t RH_pph;
      uint32_t timestamp_posix;
    };

buffer-layout will allow you to process this data with code like this:

    var lo = require('buffer-layout');
    
    var rds = new lo.Structure([lo.u8('sensor_id'),
                                lo.s16('T_Cel'),
                                lo.u16('RH_pph'),
                                lo.u32('timestamp_posix')]),
        rdb = Buffer('0517000000de262d56', 'hex');
    console.log(rds.decode(rdb));

which produces:

    { sensor_id: 5,
      T_Cel: 23,
      RH_pph: 0,
      timestamp_posix: 1445799646 }

If you need to generate data encoded in this format:

    function Reading (sn, temp, hum) {
        this.sensor_id = sn;
        this.T_Cel = temp;
        this.RH_pph = hum;
        this.timestamp_posix = Math.floor(Date.now() / 1000);
    }
    rd = new Reading(7, -5, 16);
    rds.encode(rd, rdb);
    console.log(rdb.toString('hex'));

which produces:

    07fbff10000e4e2d56

For full details see the [documentation](http://pabigot.github.io/buffer-layout/).
