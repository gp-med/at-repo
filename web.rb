#coding: utf-8

require 'sinatra'
require 'sinatra/content_for'
require 'unidecoder'
require 'net/http'
require 'open-uri'
require 'resolv'
require 'json'
require 'haml'
require 'csv'
require 'pp'

require "#{Dir.pwd}/lib/secret.rb"


def fetch_content
  require "google_drive"
  session = GoogleDrive.saved_session("#{Dir.pwd}/lib/stored_token.json", nil, $api_id, $api_key)
  file = session.spreadsheet_by_key("1bPgpJht23rSr_vTawUMPfajX3eY58aLrwb_-0LnAl0U")
  file.worksheets.each do |ws|
    puts ws.title
    next unless ws.title == "sample data"
    CSV.open("#{Dir.pwd}/lib/#{ws.title.slug}.csv","w") do |csv|
      ws.rows.each do |row|
        csv << row
      end
    end
  end
end

def parse_content dlimg=false
  require 'redcarpet'
  require 'rmagick'

  markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, extensions = {})
  file = File.read("#{Dir.pwd}/lib/sample-data.csv")
  file.gsub! /\u00a0/, ' '
  csv = CSV.parse file
  header = csv.shift
  $cats = {}
  $tags = {}
  $items = {}

  csv.each_with_index do |row,ind|
    row.map! &:strip
    item = {"id"=>ind}
    id = 0
    row.each_with_index do |c,i|
      if i == 0
        id = c.to_i
        item["id"] = id
      elsif [6,7,10].include?(i)
        item[header[i]] = markdown.render(c.gsub("\n","\n\n")).gsub(/\n+/,"\n")
      elsif i == 2 and [["img","js","css","fonts"],$items.values.map{|x|x["slug"]}].flatten.include?(c)
        item[header[i]] = "#{c}_"
      elsif i == 3
        item[header[i]] = c
        if $cats.has_key?(c)
          $cats[c] << id
        else
          $cats[c] = [id]
        end
      elsif i == 4
        c = c.strip.split(/\s*,\s*/)
        item[header[i]] = c
        c.each do |t|
          if $tags.has_key?(t)
            $tags[t] << id
          else
            $tags[t] = [id]
          end
        end
      elsif i == 12
        item[header[i]] = c.split(/\n+/).map(&:strip)
      elsif i == 13
        c = c.split(/\n+/).map(&:strip)
        dir = "#{Dir.pwd}/public/img/items/#{id}"
        next unless c.length > 0
        Dir.mkdir(dir) unless Dir.exist?(dir)
        l = []
        if dlimg
          c.each_with_index do |u,n|
            begin
              img = Magick::ImageList.new
              img.from_blob(open(u).read)
              if img.format == "PNG"
                target = Magick::Image.new(img.columns, img.rows) { self.background_color = 'white' }
                img.composite(target, Magick::CenterGravity, Magick::CopyCompositeOp)
              end
              img.format = "JPEG"
              img.write "#{dir}/#{n}.jpg"
              img.resize_to_fill!(200, 150)
              img.write "#{dir}/t#{n}.jpg"
              l << "#{n}.jpg"
            rescue => e
              puts e
            end
          end
        else
          Dir.foreach(dir) do |f|
            next if f.match(/^[t\.]/)
            l << f
          end
        end
        item[header[i]] = l
      else
        item[header[i]] = c
      end
    end
    $items[id] = item
  end

  html = Haml::Engine.new(IO.read("#{Dir.pwd}/views/index.haml")).render(self, :@items=>$items.values)
  File.open("#{Dir.pwd}/public/index.html","w") {|f| f << html}
  File.open("#{Dir.pwd}/lib/assets/sample.html","w") {|f| f << html}

  $cats.each do |k,v|
    html = Haml::Engine.new(IO.read("#{Dir.pwd}/views/index.haml")).render(self, :@items=>$items.values_at(*v))
    Dir.mkdir("#{Dir.pwd}/public/c/#{k}") unless Dir.exist?("#{Dir.pwd}/public/c/#{k}")
    File.open("#{Dir.pwd}/public/c/#{k}/index.html","w") {|f| f << html}
    File.open("#{Dir.pwd}/lib/assets/sample.html","a") {|f| f << html}
  end

  $tags.each do |k,v|
    html = Haml::Engine.new(IO.read("#{Dir.pwd}/views/index.haml")).render(self, :@items=>$items.values_at(*v))
    Dir.mkdir("#{Dir.pwd}/public/t/#{k}") unless Dir.exist?("#{Dir.pwd}/public/t/#{k}")
    File.open("#{Dir.pwd}/public/t/#{k}/index.html","w") {|f| f << html}
    File.open("#{Dir.pwd}/lib/assets/sample.html","a") {|f| f << html}
  end

  $items.each do |k,v|
    item = v
    html = Haml::Engine.new(IO.read("#{Dir.pwd}/views/page.haml")).render(self, :@item=>item)
    Dir.mkdir("#{Dir.pwd}/public/item/#{v["slug"]}") unless Dir.exist?("#{Dir.pwd}/public/item/#{v["slug"]}")
    File.open("#{Dir.pwd}/public/item/#{v["slug"]}/index.html","w") {|f| f << html}
    File.open("#{Dir.pwd}/lib/assets/sample.html","a") {|f| f << html}
  end

  nil
  $items

end

get "/?" do 
  @items = $items.values
  index = haml :index
  return index
end

get "/c/:slug/?" do 
  @slug = params["slug"]
  ids = $cats[@slug]
  pass unless ids
  @items = $items.values_at(*ids)
  index = haml :index
  return index
end

get "/t/:slug/?" do 
  @slug = params["slug"]
  ids = $tags[@slug]
  pass unless ids
  @items = $items.values_at(*ids)
  index = haml :index
  return index
end

get "/item/:slug/?" do 
  pp params["slug"]
  @item = ($items.map {|k,v| if v["slug"] == params["slug"] then v else nil end } - [nil])[0]
  pass unless @item
  page = haml :page
  return page
end

get "/update-me/?" do
  fetch_content
  parse_content false
  "<p>content updated.<br/><a href='/'>take me back</a></p>"
end

get "/update-with-images/?" do 
  fetch_content
  parse_content true
  "<p>content updated.<br/><a href='/'>take me back</a></p>"
end

not_found do 
  redirect to "/"
end

error do 
  return haml :error
end

$items = {}
$cats = {}
$tags = {}
$title = "ActionTech Repository"
$siteurl = "https://at-repo.gpmed.org"
$description = "An online repo for Greenpeace Action & Investigation purposes"
parse_content false

class String
  def slug
    self.to_ascii.downcase.strip.gsub(/[-_\s\/]+/, '-').gsub(/[^\w-]/, '').gsub(/-+/,'-')
  end
end

