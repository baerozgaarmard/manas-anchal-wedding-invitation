import imageio.v2 as io
from PIL import Image,ImageDraw
r=io.get_reader(r'C:/Users/Ayush/Downloads/aa075706f3f24e9caaa27155171c981c.MP4')
m=r.get_meta_data();print(m)
duration=m['duration']; frames=[]
for i in range(24):
 t=duration*i/24; im=Image.fromarray(r.get_data(int(t*m['fps'])));im.thumbnail((160,285));frames.append((t,im))
out=Image.new('RGB',(160*8,310*3),'#eee5d9');d=ImageDraw.Draw(out)
for i,(t,im) in enumerate(frames):
 x=(i%8)*160;y=(i//8)*310;out.paste(im,(x,y));d.text((x+6,y+286),f'{t:.1f}s',fill='black')
out.save('tools/reference-sequence.jpg')
